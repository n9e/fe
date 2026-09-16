import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ActionResponse, UIAction } from '@flashcatcloud/ai-kit/actions';
import type { IRawTimeRange } from '@/components/TimeRangePicker';
import type { IAiChatTurnScope, IAiQueryProgress } from '@/components/AiChatNG/types';
import { NAME_SPACE } from '@/components/AiChatNG/constants';
import { uiActionRuntime } from '@/components/AiChatNG/uiActionRuntime';

/** What a query panel looks like at one moment; enough to put it back. */
export interface QueryDockSnapshot {
  query: string;
}

/**
 * Lets the dock drive a query panel the way a user would: write into the box,
 * then press the query button. Separate steps on purpose — the assistant's
 * cursor moves between them, so what the user sees matches what happened.
 */
export interface QueryDockControl<S extends QueryDockSnapshot = QueryDockSnapshot> {
  snapshot(): S;
  /** Bumps whenever the user touches the panel; a turn that started on an older revision may not write. */
  revision(): number;
  /** Writes the statement, the window when one was asked for, and the panel settings the action declared. */
  fill(query: string, range?: IRawTimeRange, settings?: Record<string, string>): void;
  run(options?: { signal?: AbortSignal }): Promise<{ empty: boolean; count?: number }>;
  restore(snapshot: S): void;
  queryInput(): Element | null;
  queryButton(): Element | null;
}

/** The one page action a query panel declares: how its statement is named to the model. */
export interface QueryDockAction {
  /** Tool name the page declares, e.g. set_metric_query. */
  name: string;
  /** Schema property carrying the statement, e.g. promql; the page reports the delivered statement under the same key. */
  argument: string;
  /** What the statement is called in the tool description, e.g. "PromQL expression". */
  language: string;
  /** A follow-up hint in the shape the model should imitate. */
  followUpExample: string;
  /** Other panel settings the statement needs, each an optional string argument (e.g. a log table's database). */
  settings?: { name: string; description: string }[];
  page: { title: string; summary: string };
}

export interface QueryDockActionsOptions<S extends QueryDockSnapshot = QueryDockSnapshot> {
  enabled: boolean;
  datasourceValue: number;
  getControl: () => QueryDockControl<S> | null;
  action: QueryDockAction;
}
interface SetQueryArgs {
  [argument: string]: unknown;
  time_range?: { start: string; end: string } | null;
  follow_up?: string | null;
}
interface QueryTurn<S extends QueryDockSnapshot> {
  controller: AbortController;
  datasource: number;
  revision: number;
  control: QueryDockControl<S> | null;
  stage: 'unchanged' | 'filled' | 'queried';
  changed: boolean;
  finished?: boolean;
  callId?: string;
}

export function useQueryDockActions<S extends QueryDockSnapshot = QueryDockSnapshot>(options: QueryDockActionsOptions<S>) {
  const { t: translate } = useTranslation(NAME_SPACE);
  const translationRef = useRef(translate);
  translationRef.current = translate;
  const t = (key: string) => translationRef.current(key);
  const latest = useRef(options);
  latest.current = options;
  const turnRef = useRef<QueryTurn<S>>();
  const undoRef = useRef<{ snapshot: S; datasource: number; revision: number }>();
  const [canUndo, setCanUndo] = useState(false);
  const [progress, setProgress] = useState<IAiQueryProgress>({ phase: 'idle' });
  const report = (turn: QueryTurn<S>, next: IAiQueryProgress) => {
    if (turnRef.current === turn) setProgress(next);
  };
  const changed = (turn: QueryTurn<S>) =>
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
    const turn: QueryTurn<S> = {
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

  const { action } = options;
  useEffect(() => {
    if (!options.enabled) {
      cancel();
      return;
    }
    const actions: UIAction<SetQueryArgs>[] = [
      {
        name: action.name,
        description: `Fill and run a ${action.language} in the current query panel. Send a statement verified against the selected data source. The page reports its actual query result. Nothing is saved.`,
        inputSchema: {
          type: 'object',
          properties: {
            [action.argument]: {
              type: 'string',
              description: `The complete ${action.language} to run, exactly as it should appear in the input box.`,
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
            follow_up: {
              type: 'string',
              description:
                `The one refinement the user is most likely to ask for next, as a short sentence in their language (under 20 characters), e.g. "${action.followUpExample}". ` +
                'Base it on what you actually found in the data source. It is shown as a hint in the input box, never run.',
            },
            ...Object.fromEntries((action.settings ?? []).map((setting) => [setting.name, { type: 'string', description: setting.description }])),
          },
          required: [action.argument],
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
            const statement = args[action.argument];
            const query = typeof statement === 'string' ? statement.trim() : '';
            if (!query) throw new Error(t('page_action.malformed'));
            report(turn, { phase: 'applying', stage: 'unchanged' });
            await ctx.feedback.moveCursor(control.queryInput());
            guard();
            undoRef.current = { snapshot: control.snapshot(), datasource: turn.datasource, revision: turn.revision };
            ctx.feedback.highlight(control.queryInput());
            const settings = Object.fromEntries(
              (action.settings ?? []).flatMap((setting) => {
                const value = args[setting.name];
                return typeof value === 'string' && value.trim() ? [[setting.name, value.trim()]] : [];
              }),
            );
            if (action.settings) control.fill(query, args.time_range ?? undefined, settings);
            else control.fill(query, args.time_range ?? undefined);
            turn.stage = 'filled';
            setCanUndo(true);
            await ctx.feedback.click(control.queryButton());
            guard();
            turn.stage = 'queried';
            report(turn, { phase: 'querying', stage: turn.stage });
            const result = await control.run({ signal: turn.controller.signal });
            guard();
            report(turn, { phase: result.empty ? 'empty' : 'success', stage: turn.stage, count: result.count, followUp: args.follow_up?.trim().slice(0, 60) || undefined });
            return { [action.argument]: latest.current.getControl()!.snapshot().query, datasource_id: turn.datasource, empty: result.empty, count: result.count };
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
      title: action.page.title,
      summary: action.page.summary,
    });
    return () => {
      turnRef.current?.controller.abort();
      dispose();
    };
  }, [options.enabled, cancel, action]);

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
  // A new conversation starts with a blank status line; what the assistant
  // already wrote stays in the box, and undo stays with it.
  const reset = useCallback(() => {
    cancel();
    setProgress({ phase: 'idle' });
  }, [cancel]);
  return { prepareTurn, progress, canUndo, undo, cancel, invalidateUndo, reset };
}
