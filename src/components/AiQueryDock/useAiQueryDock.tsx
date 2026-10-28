import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { IS_ENT } from '@/utils/constant';
import { timeRangeUnix } from '@/components/TimeRangePicker';
import type { IRawTimeRange } from '@/components/TimeRangePicker';
import { buildPageFrom } from '@/components/AiChatNG/recommend';
import { NAME_SPACE } from '@/components/AiChatNG/constants';
import AiQueryDock from './index';
import { AiQueryDockTrigger } from './Trigger';
import { useQueryDockActions } from './useQueryDockActions';
import type { QueryDockAction, QueryDockControl, QueryDockSnapshot } from './useQueryDockActions';

/**
 * What does not change about a query panel while it is used: the kind of data
 * source it queries, the action it declares, and how the dock talks about it.
 * Declare one per panel (or per syntax, when a panel has several) as a module
 * constant.
 */
export interface AiQueryDockAdapter {
  /** Sent as page_from datasource_type, e.g. "prometheus". */
  datasourceType: string;
  /** The page_from key the statement goes under: the backend reads promql for PromQL and query for everything else. */
  statementParam?: 'promql' | 'query';
  action: QueryDockAction;
  /** i18n keys of the suggested questions: each key is the label, and key + "_query" the question it sends. */
  prompts: string[];
  resultNoun?: 'series' | 'rows';
  /** i18n key of the placeholder before the first message; the metrics wording when left out. */
  placeholder?: string;
}

type DockSnapshot = QueryDockSnapshot & { range?: IRawTimeRange };

export interface AiQueryDockOptions<S extends DockSnapshot> {
  datasourceValue: number;
  getControl: () => QueryDockControl<S> | null;
  /** More of the page to send with each message, read at send time, e.g. a log table's columns. */
  pageParams?: () => Record<string, unknown>;
  /** The user pressed the trigger; runs before the dock opens or closes. */
  onToggle?: () => void;
}

/**
 * The dock for one query panel, from its adapter and its control.
 *
 * Owns what every panel would otherwise repeat: whether the dock is open, the
 * action it lets the assistant run (only while open), what each message says
 * about the page, and the trigger and dock elements. The panel puts `trigger`
 * in its box and `dock` under it, and calls `invalidateUndo` when the user
 * takes the panel back. Outside the Flashcat enterprise build both elements
 * are undefined and the action never registers: the assistant there is the
 * n9e one, which does not run page actions.
 */
export function useAiQueryDock<S extends DockSnapshot>(adapter: AiQueryDockAdapter, options: AiQueryDockOptions<S>) {
  const { t } = useTranslation(NAME_SPACE);
  const [open, setOpen] = useState(false);
  const latest = useRef({ adapter, options });
  latest.current = { adapter, options };
  const actions = useQueryDockActions({
    enabled: IS_ENT && open,
    datasourceValue: options.datasourceValue,
    getControl: options.getControl,
    action: adapter.action,
  });
  const { cancel } = actions;

  // Read when a message is sent, not when rendered: the box, the window and
  // the data source may all have moved since. The chat reads it through a ref,
  // so it can keep one identity.
  const pageFrom = useCallback(() => {
    const { adapter: current, options: now } = latest.current;
    const snapshot = now.getControl()?.snapshot();
    const range = snapshot?.range?.start && snapshot.range.end ? timeRangeUnix(snapshot.range) : undefined;
    return buildPageFrom({
      param: {
        datasource_type: current.datasourceType,
        datasource_id: now.datasourceValue,
        [current.statementParam ?? 'query']: snapshot?.query?.trim() || undefined,
        start: range ? String(range.start) : undefined,
        end: range ? String(range.end) : undefined,
        ...now.pageParams?.(),
      },
    });
  }, []);
  const promptList = useMemo(() => adapter.prompts.map((key) => ({ label: t(key), value: t(`${key}_query`) })), [t, adapter.prompts]);

  const toggle = () => {
    options.onToggle?.();
    if (open) cancel();
    setOpen((previous) => !previous);
  };

  return {
    open,
    trigger: IS_ENT ? <AiQueryDockTrigger open={open} onClick={toggle} /> : undefined,
    dock: IS_ENT ? (
      <AiQueryDock
        open={open}
        pageFrom={pageFrom}
        progress={actions.progress}
        prepareTurn={actions.prepareTurn}
        canUndo={actions.canUndo}
        onUndo={actions.undo}
        promptList={promptList}
        resultNoun={adapter.resultNoun}
        placeholder={adapter.placeholder ? t(adapter.placeholder) : undefined}
        onNewConversation={actions.reset}
        onClose={() => {
          cancel();
          setOpen(false);
        }}
      />
    ) : undefined,
    invalidateUndo: actions.invalidateUndo,
  };
}
