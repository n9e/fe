import { useRef } from 'react';

import type { PromGraphControl } from '@/components/PromGraphCpt';
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
}

/**
 * The assistant on one metric query panel.
 *
 * All builds use `trigger` for the box and `dock` under it. The graph exposes
 * its query box through `controlRef` so the assistant can run page actions.
 */
export function usePrometheusAiDock({ datasourceValue, onTakeOver }: Options) {
  // This panel's own box: panels on one page can each be on a different data
  // source, so the assistant is handed the box, not a page-wide lookup.
  const controlRef = useRef<PromGraphControl | null>(null);
  const ai = useAiQueryDock(PROMQL_DOCK, {
    datasourceValue,
    getControl: () => controlRef.current,
    onToggle: onTakeOver,
  });
  return {
    controlRef,
    trigger: ai.trigger,
    dock: ai.dock,
    onUserContextChange: ai.invalidateUndo,
  };
}
