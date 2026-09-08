import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { ChatPanel, EAiChatContentType, IAiChatMessage, IAiChatPageInfo, IAiChatTurn } from '@/components/AiChatNG';
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
 * closed; `open` only decides whether it is on screen.
 */
export interface AiQueryDockProps {
  open: boolean;
  pageFrom: IAiChatPageInfo;
  /** What the answer was checked against, for the status line — a data source name. */
  contextLabel?: string;
  promptList?: string[];
  onClose: () => void;
  className?: string;
}

/** How long a step may run before the status starts counting seconds. */
const SHOW_ELAPSED_AFTER_MS = 15_000;

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

/** Name of the step in progress: the backend's sentence when it gives one, else the latest tool it named. */
function currentStep(message: IAiChatMessage): string | undefined {
  const curStep = message.cur_step?.trim();
  if (curStep) return curStep;
  for (const response of [...(message.response ?? [])].reverse()) {
    if (response.content_type !== 'tool_group') continue;
    const items = (response.param as { items?: { content?: string }[] } | undefined)?.items ?? [];
    const name = items[items.length - 1]?.content?.trim();
    if (name) return name;
  }
  return undefined;
}

function stepCount(message: IAiChatMessage): number {
  return (message.response ?? []).reduce((count, response) => {
    if (response.content_type !== 'tool_group') return count;
    return count + ((response.param as { items?: unknown[] } | undefined)?.items?.length ?? 0);
  }, 0);
}

export default function AiQueryDock(props: AiQueryDockProps) {
  const { open, pageFrom, contextLabel, promptList, onClose, className } = props;
  const { t } = useTranslation(NAME_SPACE);
  const rootRef = useRef<HTMLDivElement>(null);
  const [chatId, setChatId] = useState<string>();
  const [turn, setTurn] = useState<IAiChatTurn>();
  const [expanded, setExpanded] = useState(true);
  const [startedAt, setStartedAt] = useState<number>();
  const [now, setNow] = useState(() => Date.now());

  // The conversation opens while the assistant works, so the steps are in
  // view, and closes once it has delivered, so the result is. A turn that
  // ends any other way — a question back, nothing found, an error — is
  // something to read, so it stays open.
  const handleTurn = useCallback((next: IAiChatTurn) => {
    setTurn(next);
    if (next.phase === 'running') {
      setStartedAt((previous) => previous ?? Date.now());
      setExpanded(true);
      return;
    }
    setStartedAt(undefined);
    setExpanded(!delivered(next.message));
  }, []);

  useSoleOpenDock(open, onClose);

  useEffect(() => {
    if (!open) return;
    rootRef.current?.querySelector('textarea')?.focus();
  }, [open]);

  useEffect(() => {
    if (!startedAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  const running = turn?.phase === 'running';
  const message = turn?.message;
  let tone: 'idle' | 'running' | 'ok' | 'warn' | 'error' = 'idle';
  let status: React.ReactNode = t('dock.idle');
  if (turn && message) {
    if (running) {
      tone = 'running';
      const elapsed = startedAt ? now - startedAt : 0;
      status = (
        <>
          {currentStep(message) ?? t('dock.understanding')}…{elapsed >= SHOW_ELAPSED_AFTER_MS && <span className='ml-1 tabular-nums'>{Math.round(elapsed / 1000)}s</span>}
        </>
      );
    } else if (turn.reason === 'stopped') {
      tone = 'warn';
      status = t('dock.stopped');
    } else if (turn.reason === 'error' || message.err_code) {
      tone = 'error';
      status = t('dock.failed');
    } else if (delivered(message)) {
      tone = 'ok';
      const steps = stepCount(message);
      status = (
        <>
          {contextLabel ? t('dock.verified_on', { name: contextLabel }) : t('dock.delivered')}
          {steps > 0 && <span className='ml-1 text-hint'>· {t('dock.steps', { count: steps })}</span>}
        </>
      );
    } else if (lastResponseType(message) === 'input_request') {
      status = t('dock.asked');
    } else {
      status = t('dock.replied');
    }
  }

  const asked = !running && !!message && lastResponseType(message) === 'input_request';
  const placeholder = !turn ? t('dock.placeholder_first') : asked ? t('dock.placeholder_answer') : t('dock.placeholder_follow_up');

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      hidden={!open}
      className={cn('mb-3 outline-none', className)}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return;
        // Scoped, not global: Esc belongs to whatever is open inside the page.
        event.stopPropagation();
        // Two levels: an open conversation closes first, the dock second.
        if (expanded && turn) {
          setExpanded(false);
          return;
        }
        onClose();
      }}
    >
      <ChatPanel
        variant='slim'
        collapsed={!expanded}
        chatId={chatId}
        queryPageFrom={pageFrom}
        promptList={promptList}
        placeholder={placeholder}
        onChatChange={(chat) => setChatId(chat?.chat_id)}
        onTurn={handleTurn}
        inputPrefix={
          <div className='flex min-w-[200px] shrink-0 items-center gap-1.5 text-xs text-main' role='status' aria-live='polite'>
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
            <span className='truncate'>{status}</span>
            {turn && (
              <Button type='link' size='small' className='px-1' onClick={() => setExpanded((previous) => !previous)}>
                {expanded ? t('dock.collapse') : t('dock.expand')}
              </Button>
            )}
          </div>
        }
        inputSuffix={<Button type='text' size='small' icon={<CloseOutlined />} aria-label={t('dock.close')} onClick={onClose} />}
      />
    </div>
  );
}
