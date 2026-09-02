import { useEffect, useRef } from 'react';

import { uiActionRuntime } from '@/components/AiChatNG/uiActionRuntime';
import type { UIAction } from '@flashcatcloud/ai-kit/actions';
import type { IRawTimeRange } from '@/components/TimeRangePicker';

/**
 * The ad-hoc metric query page, described to the assistant.
 *
 * The assistant could already write PromQL into a reply, but the user then had
 * to select it, copy it and paste it into the box — and a query the assistant
 * cannot run is a query it never sees the result of. This action closes that
 * gap: the expression lands in the same input the user types into, and the
 * page's own effects re-run the query from there, exactly as they do after a
 * keystroke.
 *
 * It sets the query and nothing else. There is no "save" on this page, so
 * there is nothing here to undo — the previous expression is one Ctrl+Z or one
 * click of 历史记录 away.
 */

export interface MetricExplorerAIActionsOptions {
  /** Whether this panel owns the open conversation. See the note in the hook. */
  enabled: boolean;
  /** The data source the panel is pointed at, echoed back for the card. */
  datasourceValue: number;
  /** Writes the expression into the panel, which re-runs the query. */
  setPromql: (promql: string) => void;
  /** Moves the panel's time range. Only used when the model asks for one. */
  setTimeRange: (range: IRawTimeRange) => void;
  /**
   * This panel's own PromQL box, used only to point the cursor at what changed.
   *
   * Resolved by the caller rather than looked up here: panels on this page can
   * each be on a different data source and only some of them render a PromQL
   * box, so no page-wide position or selector reliably means "this panel".
   */
  getQueryInput: () => Element | null;
}

interface SetMetricQueryArgs {
  promql: string;
  /** Both ends, or nothing: the schema's nested `required` is enforced. Null
   *  still gets through, which is the one case `run()` has to handle. */
  time_range?: { start: string; end: string } | null;
}

export function useMetricExplorerAIActions(options: MetricExplorerAIActionsOptions): void {
  const latest = useRef(options);
  latest.current = options;

  useEffect(() => {
    // Every panel on this page is the same component, so without this guard a
    // second panel would register the same action name and quietly take over
    // the first one's — ai-kit lets the later registration win. Registering
    // only from the panel whose AI button opened the conversation keeps
    // "which panel does this write to" answerable rather than incidental.
    if (!options.enabled) return;

    const actions: UIAction<SetMetricQueryArgs>[] = [
      {
        name: 'set_metric_query',
        description:
          'Put a PromQL expression into the ad-hoc metric query page and run it. ' +
          'Use this instead of only printing the expression in the reply: it fills the same input the user types into, so the chart and the series table refresh immediately. ' +
          'Send the expression you have already verified against this data source — this action runs it, it does not check it. ' +
          'It changes nothing else: no dashboard, no alert rule, nothing is saved.',
        schema: {
          type: 'object',
          properties: {
            promql: {
              type: 'string',
              description: 'The complete expression to run, exactly as it should appear in the input box.',
            },
            time_range: {
              type: 'object',
              description:
                'Optional. Only send it when the user asked for a particular window, otherwise the panel keeps the range it is on. ' +
                'Both ends accept the relative syntax the page itself uses, e.g. "now-6h" and "now".',
              properties: {
                start: { type: 'string', description: 'Window start, e.g. "now-6h".' },
                end: { type: 'string', description: 'Window end, usually "now".' },
              },
              required: ['start', 'end'],
            },
          },
          required: ['promql'],
        },
        // Nothing is persisted, and the user already clicked the card to get
        // here. A second confirmation would be a dialog in front of a dialog.
        policy: 'auto',
        run: async (args, ctx) => {
          const promql = args.promql?.trim();
          // The runtime already rejects a missing or empty string. Whitespace
          // that only looks like a query is the part it cannot catch.
          if (!promql) throw new Error('No expression was supplied.');

          const { datasourceValue, setPromql, setTimeRange, getQueryInput } = latest.current;
          const anchor = getQueryInput();
          await ctx.feedback.moveCursor(anchor);
          ctx.feedback.highlight(anchor);

          // Half a window would silently reframe the chart around a range nobody
          // asked for, but the schema already rules that out — only an explicit
          // null still reaches here, and it means "no window", same as absent.
          const movedRange = args.time_range ?? undefined;
          if (movedRange) {
            setTimeRange(movedRange);
          }
          setPromql(promql);

          return {
            promql,
            datasource_id: datasourceValue,
            time_range: movedRange,
            // Said plainly because the card shows this to the user, who can see
            // the page for themselves and would notice a grander claim.
            note: 'Written into the query box and run. Nothing was saved.',
          };
        },
      },
    ];

    return uiActionRuntime.register(actions, {
      route: `${window.location.pathname}${window.location.search}`,
      title: '指标分析 · 即时查询',
      summary:
        'The user is on the ad-hoc metric query page, running PromQL against one data source and reading the result as a chart or a series table. ' +
        'Nothing on this page is saved, so a query can be replaced freely.',
    });
    // Live values are read through a ref so that typing in the box, or moving
    // the time range, does not churn the registration.
  }, [options.enabled]);
}
