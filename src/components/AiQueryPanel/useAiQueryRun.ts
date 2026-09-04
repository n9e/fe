import { useCallback, useEffect, useRef, useState } from 'react';
import type { TFunction } from 'i18next';

import { createChat, getMessageDetail, sendMessage } from '@/components/AiChatNG/services';
import { EAiChatContentType, IAiChatMessage, IAiChatMessageResponse, IAiChatPageInfo } from '@/components/AiChatNG/types';

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
/** Long enough for a verified answer (several data-source round trips), short
 *  enough that a wedged run does not hang the panel forever. */
const RUN_TIMEOUT_MS = 5 * 60 * 1000;

export type AiQueryPhase = 'idle' | 'running' | 'done' | 'failed';

export interface AiQueryStep {
  /** What the assistant did, in the user's words. */
  label: string;
  done: boolean;
}

export interface AiQueryRun {
  phase: AiQueryPhase;
  steps: AiQueryStep[];
  /** The value to write into the field. Only set when the assistant delivered one. */
  value?: string;
  /** What the assistant said about it, or — when nothing was delivered — why. */
  explanation?: string;
  error?: string;
}

const EMPTY_RUN: AiQueryRun = { phase: 'idle', steps: [] };

/** Tool segments carry a coarse kind alongside the tool name; the kind is what
 *  a reader can act on ("it ran something", "it read a file"). */
function stepLabel(response: IAiChatMessageResponse, t: TFunction): string {
  if (response.tool_call_statistic_type === 'read_file') return t('panel.step.read_file');
  if (response.tool_call_statistic_type === 'edit_file') return t('panel.step.edit_file');
  return t('panel.step.command');
}

function reduceMessage(message: IAiChatMessage, t: TFunction): AiQueryRun {
  const responses = message.response ?? [];
  const steps: AiQueryStep[] = [];
  const said: string[] = [];
  let value: string | undefined;

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
      case EAiChatContentType.Tool:
        steps.push({ label: stepLabel(response, t), done: response.is_finish !== false });
        break;
      default:
        break;
    }
  }

  // The step in flight has no segment yet — the backend reports it separately.
  const curStep = message.cur_step?.trim();
  if (!message.is_finish && curStep) {
    steps.push({ label: curStep, done: false });
  }

  if (message.err_code) {
    return { phase: 'failed', steps, explanation: said.join('\n\n') || undefined, error: message.err_msg || message.err_title };
  }
  if (!message.is_finish) {
    return { phase: 'running', steps };
  }
  return { phase: 'done', steps, value, explanation: said.join('\n\n') || undefined };
}

export interface UseAiQueryRunOptions {
  /** Where the user is, and what the page knows — the data source above all. */
  pageFrom: IAiChatPageInfo;
  t: TFunction;
}

export function useAiQueryRun({ pageFrom, t }: UseAiQueryRunOptions) {
  const [run, setRun] = useState<AiQueryRun>(EMPTY_RUN);
  const chatIdRef = useRef<string>();
  // Bumped on every start and on unmount, so a poll from an abandoned run
  // cannot write over a newer one — the user asking again mid-run is normal.
  const runIdRef = useRef(0);
  const latest = useRef({ pageFrom, t });
  latest.current = { pageFrom, t };

  useEffect(() => () => { runIdRef.current += 1; }, []);

  const ask = useCallback(async (question: string) => {
    const asked = question.trim();
    if (!asked) return;

    const runId = (runIdRef.current += 1);
    const isCurrent = () => runIdRef.current === runId;
    setRun({ phase: 'running', steps: [] });

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
      if (!isCurrent()) return;

      const deadline = Date.now() + RUN_TIMEOUT_MS;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        if (!isCurrent()) return;
        if (Date.now() > deadline) {
          setRun((previous) => ({ ...previous, phase: 'failed', error: latest.current.t('panel.timeout') }));
          return;
        }
        const detail = await getMessageDetail({ chat_id: sent.chat_id, seq_id: sent.seq_id });
        if (!isCurrent()) return;
        const next = reduceMessage(detail, latest.current.t);
        setRun(next);
        if (next.phase !== 'running') return;
      }
    } catch (error) {
      if (!isCurrent()) return;
      setRun({ phase: 'failed', steps: [], error: error instanceof Error ? error.message : String(error) });
    }
  }, []);

  return { run, ask };
}
