import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Tooltip } from 'antd';
import type { AiChatPageFromSource, IAiChatProps, IAiChatInputRequest, IAiQueryProgress } from '@/components/AiChatNG/types';
import { ChevronDown, ChevronUp, SquarePen, Undo2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ChatPanel, EAiChatContentType, IAiChatMessage, IAiChatTurn } from '@/components/AiChatNG';
import { NAME_SPACE } from '@/components/AiChatNG/constants';
import { cn } from '@/components/AiChatNG/utils';

/**
 * The assistant docked under a page's own input box.
 *
 * One row that is always there — a status, and the chat's input — plus the
 * conversation floating below it on demand. The chat itself is the ordinary
 * ChatPanel in its slim form; this shell only decides where it sits, when
 * the conversation is open, and what the status says. Writing into the page
 * is not done here either: the page declares an action with the runtime and
 * the panel runs it when the model asks.
 *
 * Opening and closing does not change the conversation: one dock, one
 * conversation, until the page goes away. So the dock stays mounted while
 * closed; `open` only decides whether it is on screen. Delivery folds the
 * message list; the user unfolds it — running turns never yank it open again.
 */
export interface AiQueryDockProps {
  open: boolean;
  pageFrom: AiChatPageFromSource;
  progress?: IAiQueryProgress;
  prepareTurn?: IAiChatProps['prepareTurn'];
  canUndo?: boolean;
  onUndo?: () => void;
  promptList?: IAiChatProps['promptList'];
  /** The user asked for a fresh conversation: the page resets its status; the query box is left alone. */
  onNewConversation?: () => void;
  /** What a delivered count counts: time series (default) or table rows. */
  resultNoun?: 'series' | 'rows';
  onClose: () => void;
  className?: string;
}

/** One box for every icon button on the row, so they line up and read as one set. */
const ICON_BUTTON = 'flex h-6 w-6 items-center justify-center p-0 text-hint hover:text-main';
const ICON = 14;
const STROKE = 1.75;

/** How long a step may run before the status starts counting seconds. */
const SHOW_ELAPSED_AFTER_MS = 15_000;

/**
 * Seconds since `since`, shown once a step has been going a while. Ticks on
 * its own so the dock — and the chat under it — does not re-render every
 * second just to move a number.
 */
function Elapsed({ since }: { since: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const elapsed = now - since;
  if (elapsed < SHOW_ELAPSED_AFTER_MS) return null;
  return <span className='ml-1 tabular-nums'>{Math.round(elapsed / 1000)}s</span>;
}

/**
 * Close callbacks of the docks currently open on the page.
 *
 * Every dock's page registers the same action name with the one runtime, and
 * the last registration wins — so with two docks open, the assistant's answer
 * on one panel would be written into the other. Opening a dock therefore
 * closes the rest; the conversations they held are kept, only hidden.
 */
const openDocks = new Set<() => void>();

function useSoleOpenDock(open: boolean, close: () => void) {
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    if (!open) return;
    const mine = () => closeRef.current();
    openDocks.forEach((other) => other());
    openDocks.clear();
    openDocks.add(mine);
    return () => {
      openDocks.delete(mine);
    };
  }, [open]);
}

function lastResponseType(message: IAiChatMessage): string | undefined {
  const responses = message.response ?? [];
  return responses[responses.length - 1]?.content_type;
}

/** The turn ended with the model handing the page something to run. */
function delivered(message: IAiChatMessage): boolean {
  return lastResponseType(message) === EAiChatContentType.PageAction;
}

export default function AiQueryDock(props: AiQueryDockProps) {
  const { open, pageFrom, promptList, onClose, resultNoun, onNewConversation, className, progress, prepareTurn, canUndo, onUndo } = props;
  const { t } = useTranslation(NAME_SPACE);
  const rootRef = useRef<HTMLDivElement>(null);
  const [chatId, setChatId] = useState<string>();
  const [turn, setTurn] = useState<IAiChatTurn>();
  const [expanded, setExpanded] = useState(true);
  const readingRef = useRef(false);
  const [sendError, setSendError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const handleError = useCallback((error: Error) => setSendError(error.message), []);
  const [startedAt, setStartedAt] = useState<number>();
  // Each conversation is its own ChatPanel: remounting is the one way to
  // start clean, since the panel keeps the chat it created even when the
  // parent hands back no id.
  const [generation, setGeneration] = useState(0);
  const startNewConversation = () => {
    setGeneration((previous) => previous + 1);
    setChatId(undefined);
    setTurn(undefined);
    setSendError(undefined);
    setStartedAt(undefined);
    readingRef.current = false;
    setExpanded(true);
    onNewConversation?.();
  };

  // Delivery folds the list so the chart is free; everything else leaves
  // expansion alone. New steps must not yank the list open again — the user
  // chose to collapse, and only their click (or Esc's inverse) opens it.
  const handleTurn = useCallback((next: IAiChatTurn) => {
    setTurn(next);
    setSendError(undefined);
    if (next.phase === 'running') {
      setStartedAt((previous) => previous ?? Date.now());
      return;
    }
    setStartedAt(undefined);
    if (delivered(next.message) && next.actionOutcome?.ok && !readingRef.current) setExpanded(false);
  }, []);

  useSoleOpenDock(open, onClose);
  // Also wired to the status text: it is the biggest target on the row.
  const toggleExpanded = () => {
    readingRef.current = !expanded;
    setExpanded(!expanded);
  };

  useEffect(() => {
    if (!open) return;
    rootRef.current?.querySelector('textarea')?.focus();
  }, [open]);

  const running = progress?.phase === 'applying' || progress?.phase === 'querying' || (turn?.phase === 'running' && (!progress || progress.phase === 'idle'));
  const message = turn?.message;
  let tone: 'idle' | 'running' | 'ok' | 'warn' | 'error' = 'idle';
  let status: React.ReactNode = t('dock.idle');
  if (turn && message) {
    if (running) {
      tone = 'running';
      status = (
        <>
          {message.cur_step?.trim() || t('dock.understanding')}…{startedAt && <Elapsed since={startedAt} />}
        </>
      );
    } else if (turn.reason === 'stopped') {
      tone = 'warn';
      status = t('dock.stopped');
    } else if (turn.reason === 'error' || message.err_code) {
      tone = 'error';
      status = (
        <>
          {t('dock.turn_failed')}
          {message.err_msg || message.err_title ? ` · ${message.err_msg || message.err_title}` : ''}
        </>
      );
    } else if (delivered(message)) {
      if (turn.actionOutcome?.ok) {
        tone = 'ok';
        const result = turn.actionOutcome.result as { empty?: boolean } | undefined;
        status = t(result?.empty ? 'dock.empty' : 'dock.success');
      } else if (turn.actionOutcome) {
        tone = turn.actionOutcome.status === 'declined' ? 'warn' : 'error';
        status = turn.actionOutcome.message || t('dock.failed');
      } else {
        tone = 'running';
        status = t('dock.applying');
      }
    } else if (lastResponseType(message) === 'input_request') {
      const response = message.response?.[message.response.length - 1];
      const question = (response?.param as IAiChatInputRequest | undefined)?.question?.trim() || response?.content?.trim();
      status = (
        <>
          <span>{t('dock.asked')}</span>
          {question ? ` · ${question}` : ''}
        </>
      );
    } else {
      status = t('dock.replied');
    }
  }

  if (!turn && busy) {
    // First send: the chat is still being created, nothing to report yet but work.
    tone = 'running';
    status = <>{t('dock.understanding')}…</>;
  }
  if (progress && progress.phase !== 'idle') {
    const phase = progress.phase;
    tone = phase === 'success' || phase === 'empty' || phase === 'undone' ? 'ok' : phase === 'failed' ? 'error' : phase === 'applying' || phase === 'querying' ? 'running' : 'warn';
    const key = phase === 'stopped' && progress.stage ? `stopped_${progress.stage}` : phase;
    // One line: what came back. The model's own account stays in the conversation.
    const headline =
      phase === 'success' && progress.count != null ? t(resultNoun === 'rows' ? 'dock.success_rows' : 'dock.success_count', { count: progress.count }) : t(`dock.${key}`);
    status = (
      <>
        <span>{headline}</span>
        {progress.message ? ` · ${progress.message}` : ''}
      </>
    );
  }
  if (sendError) {
    tone = 'error';
    status = (
      <>
        {t('dock.turn_failed')} · {sendError}
      </>
    );
  }

  const asked = !running && !!message && lastResponseType(message) === 'input_request';
  const closeLabel = t(busy || running ? 'dock.close_and_stop' : 'dock.close');
  // After a delivery the model's own suggestion replaces the generic prompt.
  const suggested = progress && (progress.phase === 'success' || progress.phase === 'empty') ? progress.followUp : undefined;
  const placeholder = !turn ? t('dock.placeholder_first') : asked ? t('dock.placeholder_answer') : suggested || t('dock.placeholder_follow_up');

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      hidden={!open}
      className={cn('mt-2 mb-1 outline-none', className)}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return;
        // Scoped, not global: Esc belongs to whatever is open inside the page.
        event.stopPropagation();
        // Two levels: an open conversation closes first, the dock second.
        if (expanded && turn) {
          readingRef.current = false;
          setExpanded(false);
          return;
        }
        onClose();
      }}
    >
      <ChatPanel
        key={generation}
        variant='slim'
        active={open}
        onBusyChange={setBusy}
        prepareTurn={() => {
          setSendError(undefined);
          return prepareTurn?.();
        }}
        onConversationInteract={() => {
          if (expanded) readingRef.current = true;
        }}
        onError={handleError}
        collapsed={!expanded}
        chatId={chatId}
        queryPageFrom={pageFrom}
        promptList={promptList}
        placeholder={placeholder}
        suggestion={suggested}
        onChatChange={(chat) => setChatId(chat?.chat_id)}
        onTurn={handleTurn}
        inputPrefix={
          <div className={cn('ai-query-dock-status flex min-w-0 items-center gap-1.5 text-xs text-main', turn && 'cursor-pointer')} onClick={turn ? toggleExpanded : undefined}>
            <span
              aria-hidden='true'
              className={cn(
                'inline-block h-[7px] w-[7px] shrink-0 rounded-full',
                tone === 'running' && 'animate-pulse bg-primary',
                tone === 'ok' && 'bg-success',
                tone === 'warn' && 'bg-warning',
                tone === 'error' && 'bg-error',
                tone === 'idle' && 'bg-fc-300',
              )}
            />
            <span className={cn('ai-query-dock-status-copy', (asked || tone === 'error') && 'ai-query-dock-status-detail')} role='status' aria-live='polite'>
              {status}
            </span>
            {canUndo && (
              <Tooltip title={t('dock.undo')}>
                <Button
                  type='text'
                  size='small'
                  className={ICON_BUTTON}
                  disabled={busy || running}
                  aria-label={t('dock.undo')}
                  onClick={onUndo}
                  icon={<Undo2 size={ICON} strokeWidth={STROKE} />}
                />
              </Tooltip>
            )}
          </div>
        }
        inputSuffix={
          <div className='flex shrink-0 items-center gap-0.5'>
            {turn && (
              <Tooltip title={expanded ? t('dock.collapse') : t('dock.expand')}>
                <Button
                  type='text'
                  size='small'
                  className={ICON_BUTTON}
                  aria-label={expanded ? t('dock.collapse') : t('dock.expand')}
                  aria-expanded={expanded}
                  onClick={toggleExpanded}
                  icon={expanded ? <ChevronUp size={ICON} strokeWidth={STROKE} /> : <ChevronDown size={ICON} strokeWidth={STROKE} />}
                />
              </Tooltip>
            )}
            {turn && (
              <Tooltip title={t('dock.new_conversation')}>
                <Button
                  type='text'
                  size='small'
                  className={ICON_BUTTON}
                  icon={<SquarePen size={ICON} strokeWidth={STROKE} />}
                  aria-label={t('dock.new_conversation')}
                  onClick={startNewConversation}
                />
              </Tooltip>
            )}
            <Tooltip title={closeLabel}>
              <Button type='text' size='small' className={ICON_BUTTON} icon={<X size={ICON} strokeWidth={STROKE} />} aria-label={closeLabel} onClick={onClose} />
            </Tooltip>
          </div>
        }
      />
    </div>
  );
}
