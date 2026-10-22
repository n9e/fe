import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Tooltip } from 'antd';
import { InfoCircleOutlined, PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NAME_SPACE } from '../../constants';
import { DefaultSearchIcon } from '../FieldsList/icons/DefaultSearchIcon';
import { PinIcon } from '../FieldsList/icons/PinIcon';
import './style.less';

type Kind = 'query' | 'stack' | 'fields';
type Active = { id: string; automatic: boolean } | null;
interface Coordination {
  active: Active;
  open: (id: string, kind: Kind, automatic: boolean) => boolean;
  close: (id: string) => void;
  seen: (kind: Kind) => boolean;
}
const Context = createContext<Coordination | null>(null);
/** Namespace each guidance receipt by account and feature. */
const key = (user: string, kind: Kind) => `log-explorer-guidance:v1:${user}:${kind}`;

/** Suppress automatic guidance while typing or interacting with another overlay. */
export function guidanceBusy(kind: Kind) {
  if (document.visibilityState === 'hidden') return true;
  if (kind !== 'query' && document.activeElement?.matches('input,textarea,[contenteditable="true"]')) return true;
  return Array.from(document.querySelectorAll<HTMLElement>('.ant-popover,.ant-tooltip,.ant-select-dropdown,.ant-picker-dropdown,.ant-modal-wrap,.ant-drawer-content-wrapper')).some(
    (element) => element.getClientRects().length > 0,
  );
}

/** Coordinate one active tip and one automatic tip per visit, persisting account receipts. */
export function GuidanceProvider({ userKey, children }: { userKey: string; children: React.ReactNode }) {
  const [active, setActive] = useState<Active>(null);
  const current = useRef<Active>(null);
  const automaticUsed = useRef(false);
  const memorySeen = useRef(new Set<string>());
  useEffect(() => {
    current.current = null;
    automaticUsed.current = false;
    setActive(null);
  }, [userKey]);
  const seen = useCallback(
    (kind: Kind) => {
      const storageKey = key(userKey, kind);
      try {
        return memorySeen.current.has(storageKey) || localStorage.getItem(storageKey) === '1';
      } catch {
        return memorySeen.current.has(storageKey);
      }
    },
    [userKey],
  );
  const close = useCallback((id: string) => {
    if (current.current?.id === id) {
      current.current = null;
      setActive(null);
    }
  }, []);
  const open = useCallback(
    (id: string, kind: Kind, automatic: boolean) => {
      if (automatic && (automaticUsed.current || current.current || seen(kind) || guidanceBusy(kind))) return false;
      if (automatic) automaticUsed.current = true;
      const storageKey = key(userKey, kind);
      memorySeen.current.add(storageKey);
      try {
        localStorage.setItem(storageKey, '1');
      } catch {
        /* Storage may be unavailable. */
      }
      current.current = { id, automatic };
      setActive(current.current);
      return true;
    },
    [seen, userKey],
  );
  useEffect(() => {
    const hide = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && current.current) close(current.current.id);
    };
    document.addEventListener('keydown', hide);
    const hideOnBackground = () => {
      if (document.visibilityState === 'hidden' && current.current) close(current.current.id);
    };
    document.addEventListener('visibilitychange', hideOnBackground);
    return () => {
      document.removeEventListener('keydown', hide);
      document.removeEventListener('visibilitychange', hideOnBackground);
    };
  }, [close]);
  return <Context.Provider value={{ active, open, close, seen }}>{children}</Context.Provider>;
}

/** Manage cancellable delayed tips, manual access and automatic dismissal. */
export function useGuidance(kind: Kind, enabled = true) {
  const context = useContext(Context);
  const id = React.useId();
  const [localOpen, setLocalOpen] = useState(false);
  const anchor = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const contextRef = useRef(context);
  contextRef.current = context;
  const cancel = useCallback(() => {
    clearTimeout(timer.current);
    contextRef.current?.close(id);
    setLocalOpen(false);
  }, [id]);
  const schedule = useCallback(
    (delay: number) => {
      clearTimeout(timer.current);
      if (!enabled || !contextRef.current || contextRef.current.seen(kind)) return;
      timer.current = setTimeout(() => {
        const element = anchor.current;
        if (!element?.getClientRects().length || guidanceBusy(kind)) return;
        contextRef.current?.open(id, kind, true);
      }, delay);
    },
    [enabled, id, kind],
  );
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      contextRef.current?.close(id);
    },
    [id],
  );
  useEffect(() => {
    if (!enabled) cancel();
  }, [enabled, cancel]);
  const automatic = context?.active?.id === id && context.active.automatic;
  useEffect(() => {
    if (!automatic) return;
    const timeout = setTimeout(cancel, 8000);
    const hide = () => {
      if (document.visibilityState === 'hidden') cancel();
    };
    document.addEventListener('visibilitychange', hide);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('visibilitychange', hide);
    };
  }, [automatic, cancel]);
  return {
    anchor,
    schedule,
    cancel,
    stopPending: () => clearTimeout(timer.current),
    open: context ? context.active?.id === id : localOpen,
    manual: (visible: boolean) => {
      if (!contextRef.current) setLocalOpen(visible);
      else if (visible) contextRef.current.open(id, kind, false);
      else cancel();
    },
  };
}

type Guide = ReturnType<typeof useGuidance>;
/** Align a real field-action icon with its concise explanation. */
function TipRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className='n9e-log-help-row'>
      <span className='n9e-log-help-row-icon' aria-hidden='true'>
        {icon}
      </span>
      <span>{children}</span>
    </div>
  );
}

/** Render shared help content with accessible closing and an optional documentation link. */
export function HelpTip({
  kind,
  guide,
  onDocs,
  defaultSearch = false,
  stack = false,
}: {
  kind: Kind;
  guide: Guide;
  onDocs?: () => void;
  defaultSearch?: boolean;
  stack?: boolean;
}) {
  const { t } = useTranslation(NAME_SPACE);
  return (
    <Tooltip
      visible={guide.open}
      onVisibleChange={guide.manual}
      trigger={['hover', 'click', 'focus']}
      mouseEnterDelay={0.35}
      mouseLeaveDelay={0.2}
      placement={kind === 'fields' ? 'rightTop' : 'bottomLeft'}
      overlayClassName='n9e-log-help-popover'
      title={
        <div className={`n9e-log-help-content n9e-log-help-${kind}`} onMouseEnter={() => guide.manual(true)}>
          <div className='n9e-log-help-title'>
            <strong>{t(`guidance.${kind}_title`)}</strong>
            <button
              type='button'
              className='n9e-log-help-close'
              aria-label={t('guidance.close')}
              onClick={(event) => {
                event.stopPropagation();
                guide.cancel();
              }}
            >
              <X size={12} />
            </button>
          </div>
          {kind === 'query' && (
            <ul className='n9e-log-help-query-list'>
              <li>{t('guidance.query_intro')}</li>
              {defaultSearch && <li>{t('guidance.default_search')}</li>}
            </ul>
          )}
          {kind === 'fields' && <p>{t('guidance.fields_intro')}</p>}
          {kind === 'fields' && (
            <TipRow
              icon={
                <>
                  <PlusCircleOutlined />
                  <MinusCircleOutlined />
                </>
              }
            >
              {t('guidance.fields_display')}
            </TipRow>
          )}
          {kind === 'fields' && defaultSearch && <TipRow icon={<DefaultSearchIcon />}>{t('guidance.fields_search')}</TipRow>}
          {kind === 'fields' && stack && <TipRow icon={<PinIcon />}>{t('guidance.fields_stack')}</TipRow>}
          {kind === 'stack' && (
            <p>
              {t('guidance.stack_intro')} <PinIcon className='n9e-log-help-inline-icon' /> {t('guidance.stack_intro_action')}
            </p>
          )}
          {kind === 'stack' && <p className='n9e-log-help-note'>{t('guidance.stack_effect')}</p>}
          {onDocs && (
            <button
              type='button'
              className='n9e-log-help-link'
              onClick={() => {
                guide.cancel();
                onDocs();
              }}
            >
              {t('guidance.docs')} →
            </button>
          )}
        </div>
      }
    >
      <button ref={guide.anchor} type='button' className='n9e-log-help-trigger' aria-label={t(`guidance.${kind}_title`)} onClick={(event) => event.stopPropagation()}>
        <InfoCircleOutlined />
      </button>
    </Tooltip>
  );
}

/** Schedule stacking guidance only after the chart becomes visible and ready. */
export function StackHelp({ ready }: { ready: boolean }) {
  const guide = useGuidance('stack', ready);
  const schedule = guide.schedule;
  const cancel = guide.cancel;
  useEffect(() => {
    const element = guide.anchor.current;
    if (!element || !ready) return;
    let visible = false;
    const resume = () => {
      if (visible && document.visibilityState !== 'hidden') schedule(2000);
      else cancel();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && element.getClientRects().length > 0;
      resume();
    });
    observer.observe(element);
    document.addEventListener('visibilitychange', resume);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', resume);
      cancel();
    };
  }, [ready, schedule, cancel]);
  return <HelpTip kind='stack' guide={guide} />;
}

/** Describe only the field actions supported by this data source. */
export function FieldsHelp({ defaultSearch, stack }: { defaultSearch?: boolean; stack?: boolean }) {
  const guide = useGuidance('fields');
  return <HelpTip kind='fields' guide={guide} defaultSearch={defaultSearch} stack={stack} />;
}
