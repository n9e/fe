import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ActionResponse, UIAction } from '@flashcatcloud/ai-kit/actions';
import type { PromGraphControl, PromGraphSnapshot } from '@/components/PromGraphCpt';
import type { IAiChatTurnScope, IAiQueryProgress } from '@/components/AiChatNG/types';
import { NAME_SPACE } from '@/components/AiChatNG/constants';
import { uiActionRuntime } from '@/components/AiChatNG/uiActionRuntime';

export interface MetricExplorerAIActionsOptions {
  enabled: boolean;
  datasourceValue: number;
  getControl: () => PromGraphControl | null;
}
interface SetMetricQueryArgs {
  promql: string;
  time_range?: { start: string; end: string } | null;
}
interface QueryTurn {
  controller: AbortController;
  datasource: number;
  revision: number;
  control: PromGraphControl | null;
  stage: 'unchanged' | 'filled' | 'queried';
  changed: boolean;
  finished?: boolean;
  callId?: string;
}

export function useMetricExplorerAIActions(options: MetricExplorerAIActionsOptions) {
  const { t: translate } = useTranslation(NAME_SPACE);
  const translationRef = useRef(translate);
  translationRef.current = translate;
  const t = (key: string) => translationRef.current(key);
  const latest = useRef(options);
  latest.current = options;
  const turnRef = useRef<QueryTurn>();
  const undoRef = useRef<{ snapshot: PromGraphSnapshot; datasource: number; revision: number }>();
  const [canUndo, setCanUndo] = useState(false);
  const [progress, setProgress] = useState<IAiQueryProgress>({ phase: 'idle' });
  const report = (turn: QueryTurn, next: IAiQueryProgress) => {
    if (turnRef.current === turn) setProgress(next);
  };
  const changed = (turn: QueryTurn) =>
    !latest.current.enabled || latest.current.datasourceValue !== turn.datasource || !turn.control || latest.current.getControl()?.revision() !== turn.revision;
  const cancel = useCallback(() => {
    const turn = turnRef.current;
    if (!turn || turn.finished || turn.controller.signal.aborted) return;
    turn.controller.abort();
    // Abort before any page write is just "the chat turn ended" — do not paint
    // "已停止，尚未修改", which reads as if the user stopped a fill that never
    // started. Only report stopped once the page has been touched.
    if (turn.stage === 'unchanged') setProgress({ phase: 'idle' });
    else setProgress({ phase: 'stopped', stage: turn.stage });
  }, []);

  const prepareTurn = useCallback((): IAiChatTurnScope => {
    turnRef.current?.controller.abort();
    const control = latest.current.getControl();
    const turn: QueryTurn = {
      controller: new AbortController(),
      datasource: latest.current.datasourceValue,
      revision: control?.revision() ?? -1,
      control,
      stage: 'unchanged',
      changed: false,
    };
    turnRef.current = turn;
    setProgress({ phase: 'idle' });
    return {
      finish: () => {
        turn.finished = true;
      },
      cancel: () => {
        if (turnRef.current === turn) cancel();
        else turn.controller.abort();
      },
      executePageAction: async (request): Promise<ActionResponse> => {
        const decline = (phase: 'changed' | 'stopped'): ActionResponse => {
          report(turn, { phase, stage: turn.stage });
          return { ok: false, status: 'declined', action: request.name, message: t(`dock.${phase}`) };
        };
        // Check before consulting the shared registry: another panel may own it now.
        if (turn.controller.signal.aborted || turnRef.current !== turn) return decline('stopped');
        if (changed(turn)) return decline('changed');
        turn.callId = request.call_id;
        const outcome = await uiActionRuntime.execute({ callId: request.call_id, name: request.name, args: request.args ?? {} });
        if (outcome.status === 'timeout') {
          const message = t('dock.timeout');
          report(turn, { phase: 'failed', stage: turn.stage, message });
          return { ...outcome, message };
        }
        if (turn.changed || (!turn.controller.signal.aborted && changed(turn))) return decline('changed');
        if (turn.controller.signal.aborted) return decline('stopped');
        if (!outcome.ok) report(turn, { phase: 'failed', stage: turn.stage, message: outcome.message });
        return outcome;
      },
    };
  }, [cancel]);

  useEffect(() => {
    if (!options.enabled) {
      cancel();
      return;
    }
    const actions: UIAction<SetMetricQueryArgs>[] = [
      {
        name: 'set_metric_query',
        description:
          'Fill and run a PromQL expression in the current query panel. Send an expression verified against the selected data source. The page reports its actual query result. Nothing is saved.',
        inputSchema: {
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
        policy: 'auto',
        run: async (args, ctx) => {
          const turn = turnRef.current;
          if (!turn || turn.callId !== ctx.callId) throw new Error(t('dock.changed'));
          const abort = () => turn.controller.abort();
          ctx.signal.addEventListener('abort', abort, { once: true });
          if (ctx.signal.aborted) abort();
          const guard = () => {
            if (turn.controller.signal.aborted || turnRef.current !== turn) throw new Error(t('dock.stopped'));
            if (changed(turn)) {
              turn.changed = true;
              throw new Error(t('dock.changed'));
            }
          };
          try {
            guard();
            const control = latest.current.getControl()!;
            const promql = args.promql?.trim();
            if (!promql) throw new Error(t('page_action.malformed'));
            report(turn, { phase: 'applying', stage: 'unchanged' });
            await ctx.feedback.moveCursor(control.queryInput());
            guard();
            undoRef.current = { snapshot: control.snapshot(), datasource: turn.datasource, revision: turn.revision };
            ctx.feedback.highlight(control.queryInput());
            control.fill(promql, args.time_range ?? undefined);
            turn.stage = 'filled';
            setCanUndo(true);
            await ctx.feedback.click(control.queryButton());
            guard();
            turn.stage = 'queried';
            report(turn, { phase: 'querying', stage: turn.stage });
            const result = await control.run({ signal: turn.controller.signal });
            guard();
            report(turn, { phase: result.empty ? 'empty' : 'success', stage: turn.stage });
            return { promql: latest.current.getControl()!.snapshot().promql, datasource_id: turn.datasource, empty: result.empty };
          } catch (error) {
            // Context changes and cancellation must never leave a success banner.
            if (turn.changed || (!turn.controller.signal.aborted && changed(turn))) {
              turn.changed = true;
              report(turn, { phase: 'changed', stage: turn.stage });
            } else if (turn.controller.signal.aborted) report(turn, { phase: 'stopped', stage: turn.stage });
            else report(turn, { phase: 'failed', stage: turn.stage, message: error instanceof Error ? error.message : String(error) });
            ctx.feedback.clear();
            throw error;
          } finally {
            ctx.signal.removeEventListener('abort', abort);
          }
        },
      },
    ];
    const dispose = uiActionRuntime.register(actions, {
      route: window.location.pathname,
      title: 'Metric explorer',
      summary: 'The user writes PromQL and reads its results in a single query panel.',
    });
    return () => {
      turnRef.current?.controller.abort();
      dispose();
    };
  }, [options.enabled, cancel]);

  const undo = useCallback(() => {
    const previous = undoRef.current;
    const control = latest.current.getControl();
    if (!previous || !control) return;
    if (previous.datasource !== latest.current.datasourceValue || previous.revision !== control.revision()) {
      undoRef.current = undefined;
      setCanUndo(false);
      setProgress({ phase: 'changed' });
      return;
    }
    turnRef.current?.controller.abort();
    control.restore(previous.snapshot);
    undoRef.current = undefined;
    setCanUndo(false);
    setProgress({ phase: 'undone' });
  }, []);

  const invalidateUndo = useCallback(() => {
    undoRef.current = undefined;
    setCanUndo(false);
  }, []);
  return { prepareTurn, progress, canUndo, undo, cancel, invalidateUndo };
}
