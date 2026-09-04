import { useCallback, useEffect, useRef, useState } from 'react';
import type { TFunction } from 'i18next';

import { cancelMessage, createChat, getMessageDetail, sendMessage } from '@/components/AiChatNG/services';
import { EAiChatContentType, IAiChatInputRequest, IAiChatMessage, IAiChatPageInfo, IAiChatToolCallGroup } from '@/components/AiChatNG/types';

/**
 * One assistant turn, reduced to what a field-filling panel needs.
 *
 * The chat panel renders the whole transcript; this renders a task. So the
 * message is read for three things only: what the assistant did (steps), the
 * value it produced, and what it said about that value. Everything else in the
 * transcript — reasoning, tool payloads — is detail this surface does not owe
 * the user.
 *
 * Progress is polled rather than streamed. `message/detail` is the durable
 * source of truth the chat itself falls back on, and a panel that shows a
 * handful of steps does not need token-level updates; skipping the stream also
 * skips its separate endpoint and its reconnect handling.
 */

const POLL_INTERVAL_MS = 1200;
/** The backend's code for "no AI model is configured" — the one failure the
 *  user can fix, and the only one worth pointing at a settings page. */
const NO_MODEL_ERR_CODE = 409;
/** A single dropped poll should not kill a four-minute run. */
const POLL_FAILURE_TOLERANCE = 3;
/** Long enough for a verified answer (several data-source round trips), short
 *  enough that a wedged run does not hang the panel forever. */
const RUN_TIMEOUT_MS = 5 * 60 * 1000;

export type AiQueryPhase = 'idle' | 'running' | 'done' | 'stopped' | 'failed';

export interface AiQueryStep {
  /** What the assistant did, in the user's words. */
  label: string;
}

export interface AiQueryRun {
  phase: AiQueryPhase;
  steps: AiQueryStep[];
  /** What the assistant is doing right now, in its own words. Only while running. */
  activity?: string;
  /** The value to write into the field. Only set when the assistant delivered one. */
  value?: string;
  /** What the assistant said about it, or — when nothing was delivered — why. */
  explanation?: string;
  /** Set when the turn ended on a question instead of an answer. Answering is
   *  just the next message, which the follow-up box already sends. */
  question?: string;
  /** The failure's own headline, when the backend gave one. Distinguishes "no
   *  model configured" from "the network is down" — different fixes. */
  errorTitle?: string;
  error?: string;
  /** Set when the backend says no model is configured: the one failure a user
   *  can act on themselves, and only if they are an admin. */
  needsModelConfig?: boolean;
}

const EMPTY_RUN: AiQueryRun = { phase: 'idle', steps: [] };

/**
 * What a run of tool calls amounts to, in the user's words.
 *
 * The backend merges consecutive tool calls into one group and hands over the
 * counts, so this is one line per group rather than one per call — which is
 * also the more readable of the two: eight rows all reading "ran a command"
 * say less than "ran 8 commands".
 */
function stepLabel(group: IAiChatToolCallGroup, t: TFunction): string {
  const parts: string[] = [];
  if (group.command_count) parts.push(t('panel.step.command', { count: group.command_count }));
  if (group.read_file_count) parts.push(t('panel.step.read_file', { count: group.read_file_count }));
  // edit_file is the agent writing its own scratch files — not evidence about
  // the query, and alarming to read on a page that touches production.
  return parts.join(t('panel.step.separator'));
}

function reduceMessage(message: IAiChatMessage, t: TFunction): AiQueryRun {
  const responses = message.response ?? [];
  const steps: AiQueryStep[] = [];
  const said: string[] = [];
  let value: string | undefined;
  let question: string | undefined;

  for (const response of responses) {
    switch (response.content_type as EAiChatContentType) {
      case EAiChatContentType.Query:
        value = response.content?.trim() || undefined;
        break;
      case EAiChatContentType.Markdown:
        if (response.content?.trim()) said.push(response.content.trim());
        break;
      // Tool calls are the only other segment worth surfacing: they are the
      // evidence that the answer was checked rather than recalled.
      case EAiChatContentType.ToolGroup:
        if (response.param) {
          const label = stepLabel(response.param as IAiChatToolCallGroup, t);
          if (label) steps.push({ label });
        }
        break;
      // A turn can end on a question rather than an answer — an ambiguous data
      // source, say. Saying "nothing was delivered" would be true but useless:
      // what the user needs is the question.
      case EAiChatContentType.InputRequest:
        question = (response.param as IAiChatInputRequest | undefined)?.question?.trim() || undefined;
        break;
      default:
        break;
    }
  }

  const activity = message.is_finish ? undefined : message.cur_step?.trim() || undefined;

  if (message.err_code) {
    return {
      phase: 'failed',
      steps,
      explanation: said.join('\n\n') || undefined,
      // err_title is the sentence written for a person; err_msg is the detail.
      // Reducing both to one string threw the readable half away.
      errorTitle: message.err_title || undefined,
      error: message.err_msg || undefined,
      needsModelConfig: message.err_code === NO_MODEL_ERR_CODE,
    };
  }
  if (!message.is_finish) {
    return { phase: 'running', steps, activity };
  }
  return { phase: 'done', steps, value, question, explanation: said.join('\n\n') || undefined };
}

export interface UseAiQueryRunOptions {
  /** Where the user is, and what the page knows — the data source above all. */
  pageFrom: IAiChatPageInfo;
  t: TFunction;
}

export function useAiQueryRun({ pageFrom, t }: UseAiQueryRunOptions) {
  const [run, setRun] = useState<AiQueryRun>(EMPTY_RUN);
  const chatIdRef = useRef<string>();
  const sentRef = useRef<{ chat_id: string; seq_id: number }>();
  // Bumped on every start and on unmount, so a poll from an abandoned run
  // cannot write over a newer one — the user asking again mid-run is normal.
  const runIdRef = useRef(0);
  const latest = useRef({ pageFrom, t });
  latest.current = { pageFrom, t };

  useEffect(
    () => () => {
      runIdRef.current += 1;
      const sent = sentRef.current;
      if (sent) cancelMessage(sent).catch(() => undefined);
    },
    [],
  );

  const ask = useCallback(async (question: string) => {
    const asked = question.trim();
    if (!asked) return;

    const runId = (runIdRef.current += 1);
    const isCurrent = () => runIdRef.current === runId;
    // Keep the answer already on screen: a follow-up refines what is there, and
    // blanking the panel mid-refinement takes away the undo for a field that is
    // still holding the previous value.
    setRun((previous) => ({ phase: 'running', steps: [], value: previous.value }));
    sentRef.current = undefined;

    try {
      if (!chatIdRef.current) {
        // One chat for the panel's lifetime, so a follow-up keeps its context.
        const chat = await createChat(latest.current.pageFrom);
        if (!isCurrent()) return;
        chatIdRef.current = chat.chat_id;
      }
      const sent = await sendMessage({
        chat_id: chatIdRef.current,
        query: { content: asked, page_from: latest.current.pageFrom },
      });
      if (!isCurrent()) {
        // Stopped while the message was in flight: it exists now, so cancel it.
        cancelMessage(sent).catch(() => undefined);
        return;
      }
      sentRef.current = sent;

      const deadline = Date.now() + RUN_TIMEOUT_MS;
      let consecutiveFailures = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        if (!isCurrent()) return;
        if (Date.now() > deadline) {
          setRun((previous) => ({
            ...previous,
            phase: 'failed',
            activity: undefined,
            errorTitle: latest.current.t('panel.timeout_title', { minutes: RUN_TIMEOUT_MS / 60000 }),
            explanation: latest.current.t('panel.timeout'),
          }));
          return;
        }
        let detail: IAiChatMessage;
        try {
          detail = await getMessageDetail({ chat_id: sent.chat_id, seq_id: sent.seq_id });
        } catch (pollError) {
          if (!isCurrent()) return;
          // One dropped poll is a blip; several in a row is the service going.
          consecutiveFailures += 1;
          if (consecutiveFailures < POLL_FAILURE_TOLERANCE) continue;
          throw pollError;
        }
        if (!isCurrent()) return;
        consecutiveFailures = 0;
        const next = reduceMessage(detail, latest.current.t);
        // A follow-up that ends on a question, a miss or an error still leaves
        // the previous answer in the field, so it keeps its card and its undo.
        setRun((previous) => ({ ...next, value: next.value ?? previous.value }));
        if (next.phase !== 'running') return;
      }
    } catch (error) {
      if (!isCurrent()) return;
      // Nothing reached the assistant, so saying it failed to find a query
      // would send the user off rewriting a question that was never asked.
      setRun((previous) => ({
        ...previous,
        phase: 'failed',
        activity: undefined,
        errorTitle: latest.current.t('panel.unreachable_title'),
        explanation: latest.current.t('panel.unreachable_hint'),
        error: error instanceof Error ? error.message : String(error),
      }));
    }
  }, []);

  /** Abandons the run in flight. The poll that lands afterwards is ignored, and
   *  the backend is told to stop too, so a retry does not race a run that is
   *  still working. */
  const stop = useCallback(() => {
    runIdRef.current += 1;
    setRun((previous) => (previous.phase === 'running' ? { ...previous, phase: 'stopped', activity: undefined } : previous));
    const sent = sentRef.current;
    if (sent) cancelMessage(sent).catch(() => undefined);
  }, []);

  return { run, ask, stop };
}
