import React, { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { IS_ENT } from '@/utils/constant';
import type { PromGraphControl } from '@/components/PromGraphCpt';
import { AiButton } from '@/components/AiChatNG/FlashAiButton';
import { buildPageFrom, getExplorerPrompts } from '@/components/AiChatNG/recommend';
import { NAME_SPACE as AI_CHAT_NS } from '@/components/AiChatNG/constants';
import { useAiQueryDock } from '@/components/AiQueryDock/useAiQueryDock';
import type { AiQueryDockAdapter } from '@/components/AiQueryDock/useAiQueryDock';

// How this panel's statement is named to the assistant.
const PROMQL_DOCK: AiQueryDockAdapter = {
  datasourceType: 'prometheus',
  statementParam: 'promql',
  action: {
    name: 'set_metric_query',
    argument: 'promql',
    language: 'PromQL expression',
    followUpExample: '改成按 env 分组取平均',
    page: { title: 'Metric explorer', summary: 'The user writes PromQL and reads its results in a single query panel.' },
  },
  prompts: ['dock.prompt_cpu', 'dock.prompt_memory', 'dock.prompt_disk'],
};

interface Options {
  datasourceValue: number;
  /** The user reached for the assistant, which is taking over the panel just like editing it by hand. */
  onTakeOver: () => void;
  /** The open-source chat button hands back a query for the box. */
  onQuery: (promql: string) => void;
}

/**
 * The assistant on one metric query panel.
 *
 * The Flashcat enterprise build gets the dock: `trigger` for the box, `dock`
 * under it, and `controlRef` for the graph to expose its box through. The
 * open-source and Nightingale commercial builds keep the chat button they
 * always had, as `chatButton`.
 */
export function usePrometheusAiDock({ datasourceValue, onTakeOver, onQuery }: Options) {
  const { i18n } = useTranslation(AI_CHAT_NS);
  // This panel's own box: panels on one page can each be on a different data
  // source, so the assistant is handed the box, not a page-wide lookup.
  const controlRef = useRef<PromGraphControl | null>(null);
  const ai = useAiQueryDock(PROMQL_DOCK, { datasourceValue, getControl: () => controlRef.current, onToggle: onTakeOver });
  const chatPageFrom = useMemo(() => buildPageFrom({ param: { datasource_type: 'prometheus', datasource_id: datasourceValue } }), [datasourceValue]);
  return {
    controlRef,
    trigger: ai.trigger,
    dock: ai.dock,
    onUserContextChange: ai.invalidateUndo,
    chatButton: IS_ENT ? undefined : (
      <AiButton
        queryPageFrom={chatPageFrom}
        queryAction={{ key: 'query_generator', param: { datasource_type: 'prometheus', datasource_id: datasourceValue } }}
        promptList={getExplorerPrompts(i18n.language)}
        onExecuteQueryForQueryContent={(promql) => onQuery(promql)}
      />
    ),
  };
}
