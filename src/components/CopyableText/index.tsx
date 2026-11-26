import React, { useEffect, useRef, useState } from 'react';
import { Tooltip, message } from 'antd';
import { CheckOutlined, CopyOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { writeClipboard } from './clipboard';
import { CopyPlacement } from './placement';
import useCopyPlacement from './useCopyPlacement';
import './style.less';

export interface CopyableTextProps {
  value: string | number | boolean | null | undefined;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  wrap?: boolean;
  overlay?: boolean;
  /** Opt in to zero-width copy controls; omitted preserves existing consumers. */
  placement?: CopyPlacement;
  showValueTooltip?: boolean;
  placeholder?: React.ReactNode;
}

export default function CopyableText({ value, children, className, style, wrap, overlay, placement, showValueTooltip = true, placeholder = '—' }: CopyableTextProps) {
  const { t } = useTranslation('resourceCopy');
  const raw = value == null || String(value).trim() === '' ? undefined : String(value);
  const floating = useCopyPlacement(placement, raw);
  const [buttonActive, setButtonActive] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'dismissed' | 'error'>('idle');
  const sequence = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    setStatus('idle');
    return () => {
      sequence.current += 1;
      clearTimeout(timer.current);
    };
  }, [raw]);

  const copy = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (raw === undefined || status === 'pending') return;
    const trigger = event.currentTarget;
    const dismissAfterCopy = event.detail > 0 && !window.matchMedia('(hover: none), (pointer: coarse)').matches;
    const current = ++sequence.current;
    clearTimeout(timer.current);
    setStatus('pending');
    try {
      await writeClipboard(raw, trigger);
      if (current !== sequence.current) return;
      setStatus('success');
      timer.current = setTimeout(() => {
        setStatus(dismissAfterCopy && !trigger.matches(':focus') ? 'dismissed' : 'idle');
      }, 1800);
    } catch {
      if (current !== sequence.current) return;
      setStatus('error');
      message.error(t('failed'));
    }
  };

  if (raw === undefined)
    return (
      <span className={className} style={style}>
        {placeholder}
      </span>
    );
  const tip = t(status === 'success' ? 'copied' : status === 'error' ? 'retry' : 'copy');
  const restoreCopyButton = () => {
    if (status === 'dismissed') setStatus('idle');
  };
  const content = (
    <span ref={floating.contentRef} className='fc-copyable-text__content'>
      {children ?? raw}
    </span>
  );
  const button = (
    <button
      type='button'
      className={classNames('fc-copyable-text__button', { 'fc-copyable-text__button--feedback': status === 'success' || status === 'error' })}
      aria-label={`${tip}: ${raw}`}
      aria-busy={status === 'pending'}
      onMouseEnter={placement ? () => setButtonActive(true) : undefined}
      onMouseLeave={placement ? () => setButtonActive(false) : undefined}
      onFocus={placement ? () => setButtonActive(true) : undefined}
      onBlur={placement ? () => setButtonActive(false) : undefined}
      onMouseDown={(event) => event.preventDefault()}
      onClick={copy}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') event.stopPropagation();
      }}
    >
      {status === 'success' || status === 'dismissed' ? <CheckOutlined /> : status === 'error' ? <ExclamationCircleOutlined /> : <CopyOutlined />}
    </button>
  );
  const root = (
    <span
      ref={floating.rootRef}
      className={classNames('fc-copyable-text', className, {
        'fc-copyable-text--wrap': wrap,
        'fc-copyable-text--overlay': overlay && !placement,
        'fc-copyable-text--floating': !!placement,
        'fc-copyable-text--active': !!placement && floating.active,
        'fc-copyable-text--dismissed': status === 'dismissed',
      })}
      style={placement ? { ...style, ...floating.layout?.style } : style}
      data-copy-side={placement ? floating.layout?.side : undefined}
      onMouseEnter={() => {
        restoreCopyButton();
        floating.activate();
      }}
      onMouseLeave={() => {
        floating.deactivate();
        if (placement) {
          setButtonActive(false);
          setTooltipOpen(false);
        }
      }}
      onFocusCapture={(event) => {
        restoreCopyButton();
        floating.focus(event);
      }}
      onBlurCapture={floating.blur}
    >
      {placement || !showValueTooltip ? (
        content
      ) : (
        <Tooltip title={raw} mouseEnterDelay={0.4} overlayClassName='fc-copyable-text-tooltip'>
          {content}
        </Tooltip>
      )}
      {placement ? button : <Tooltip title={status === 'dismissed' ? null : tip}>{button}</Tooltip>}
    </span>
  );
  return placement && showValueTooltip ? (
    <Tooltip
      title={floating.truncated ? raw : null}
      visible={!buttonActive && floating.truncated && tooltipOpen}
      onVisibleChange={setTooltipOpen}
      mouseEnterDelay={0.4}
      mouseLeaveDelay={0}
      transitionName=''
      destroyTooltipOnHide
      trigger={['hover', 'focus']}
      overlayClassName='fc-copyable-text-tooltip'
    >
      {root}
    </Tooltip>
  ) : (
    root
  );
}

/** The host tag owns its background/padding; the button only covers the value's tail. */
export function CopyableTag({ text, copyValue = text, style, placement }: { text: string; copyValue?: string; style?: React.CSSProperties; placement?: CopyPlacement }) {
  return (
    <span className='fc-copyable-tag' style={style}>
      <CopyableText value={copyValue} overlay placement={placement}>
        {text}
      </CopyableText>
    </span>
  );
}
