import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, Spin, Tooltip } from 'antd';
import type { InputRef } from 'antd';
import { CheckCircleFilled, CloseOutlined, CopyOutlined, LoadingOutlined, RedoOutlined, SwapOutlined, UndoOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { copyToClipBoard } from '@/utils';
import { NAME_SPACE } from '@/components/AiChatNG/constants';
import { IAiChatPageInfo } from '@/components/AiChatNG/types';

import { useAiQueryRun } from './useAiQueryRun';

/**
 * Writes a value into the field it sits under, from a sentence the user typed.
 *
 * Inline rather than floating: the result of the field — a chart, a table, a
 * rule preview — is directly below it, and a panel that hovers is a panel that
 * covers the thing the user is about to look at. Sitting in the flow also means
 * there is no anchor to track through scrolling, resizing or edge flips.
 *
 * The value is adopted on arrival rather than on a button, because the field it
 * writes to saves nothing by itself and Undo restores the previous value. Making
 * the user confirm buys a moment of hesitation and no safety.
 *
 * Ordered outcome first, evidence after. The assistant produces process, then an
 * artifact, then a result; someone reading this mid-incident needs them in the
 * opposite order, and the one line they must not miss is what just happened to
 * their query box.
 */

export interface AiQueryPanelProps {
  /** Where the user is, plus what the page knows — data source, above all. */
  pageFrom: IAiChatPageInfo;
  /** Named in the header so it is clear what the answer was checked against. */
  contextLabel?: string;
  /** What the field holds right now. Lets the panel notice the user edited it
   *  by hand, rather than claiming a value it no longer put there. */
  value?: string;
  /** One example of what to ask, in this page's own terms. The only fact about
   *  the host page the panel cannot work out for itself. */
  examplePrompt?: string;
  /** Writes the value into the field. Called on arrival, and again on refill. */
  onAdopt: (value: string) => void;
  /** Puts back whatever the field held before this panel touched it. */
  onUndo: () => void;
  onClose: () => void;
}

export default function AiQueryPanel(props: AiQueryPanelProps) {
  const { t } = useTranslation(NAME_SPACE);
  const { pageFrom, contextLabel, value, examplePrompt, onAdopt, onUndo, onClose } = props;
  const { run, ask, stop } = useAiQueryRun({ pageFrom, t });

  const [question, setQuestion] = useState('');
  // The task keeps its name across follow-ups: by the third turn "用 node_exporter
  // 那个" is what was last said, not what is being worked on.
  const [task, setTask] = useState('');
  const [lastSent, setLastSent] = useState('');
  const [showError, setShowError] = useState(false);
  const written = useRef<string>();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<InputRef>(null);
  const latestAdopt = useRef(onAdopt);
  latestAdopt.current = onAdopt;

  const running = run.phase === 'running';
  const settled = run.phase === 'done' || run.phase === 'failed' || run.phase === 'stopped';
  // Whether the field still holds what we produced — asked of the field itself,
  // so a hand edit or an undo is noticed rather than assumed. `written` is a
  // separate question: it is the write-once guard, so undoing does not trip the
  // effect below into putting the value straight back.
  const filled = !!run.value && value === run.value;

  // Focus on open, and again when a turn ends — unless the user has moved on to
  // the query box themselves, in which case stealing focus is worse than none.
  useEffect(() => {
    if (running) return;
    const active = document.activeElement;
    if (active && active !== document.body && !rootRef.current?.contains(active)) return;
    // preventScroll: the panel clips its own overflow, so a focus that scrolls
    // the input into view drags the header out of sight instead.
    inputRef.current?.focus({ preventScroll: true });
  }, [running]);

  // Adopting is a side effect of an answer arriving, not of a render. A new run
  // forgets what was written, so asking again fills even an identical answer.
  useEffect(() => {
    if (run.phase === 'running') return;
    if (run.phase === 'done' && run.value && run.value !== written.current) {
      written.current = run.value;
      latestAdopt.current(run.value);
    }
  }, [run.phase, run.value]);

  const send = (text: string) => {
    const next = text.trim();
    if (!next) return;
    // The first thing asked names the task; answering a question the assistant
    // raised is part of that task, not a new one.
    if (!task) setTask(next);
    setLastSent(next);
    setQuestion('');
    setShowError(false);
    ask(next);
  };

  const header = task || t('panel.untitled');
  const awaitingAnswer = !!run.question;
  const evidence = run.steps.map((step) => step.label).join(t('panel.step.separator'));
  const hasBody = running || settled;
  const placeholder = awaitingAnswer ? t('panel.answer_placeholder') : task ? t('panel.follow_up_placeholder') : t('panel.first_placeholder', { example: examplePrompt ?? t('panel.example_fallback') });

  const chip = (tone: string, label: string) => <span className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] ${tone}`}>{label}</span>;
  const statusChip = (() => {
    if (running) return chip('bg-primary/10 text-primary', t('panel.running'));
    if (run.phase === 'stopped') return chip('bg-fc-200 text-hint', t('panel.stopped'));
    if (run.phase === 'failed') return chip('bg-error/10 text-error', t('panel.failed'));
    if (awaitingAnswer) return chip('bg-warning/10 text-warning', t('panel.needs_answer'));
    if (filled) return chip('bg-success/10 text-success', t('panel.adopted'));
    return null;
  })();

  return (
    // shrink-0 because the slot this sits in is a flex column: without it the
    // panel is squeezed below its own content and the rounded clip eats the
    // header. No shadow: this belongs to the page, it does not float over it.
    <div
      ref={rootRef}
      tabIndex={-1}
      className='mb-3 shrink-0 overflow-hidden rounded-md fc-border border-antd bg-fc-50 outline-none'
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return;
        // Scoped, not global: Esc belongs to whatever is open inside the page —
        // an autocomplete, a select, the drawer this may one day live in.
        event.stopPropagation();
        if (running) stop();
        else onClose();
      }}
    >
      <div className='flex items-center gap-2 border-0 border-b border-solid border-antd px-4 py-2'>
        <Tooltip title={task || undefined}>
          <span className='min-w-0 flex-1 truncate text-[13px] font-medium text-title'>{header}</span>
        </Tooltip>
        {/* The data source decides whether the answer is right at all, so it is
            stated rather than whispered — capped, because in a 600px drawer it
            would otherwise squeeze the task name to nothing. */}
        {contextLabel ? (
          <Tooltip title={contextLabel}>
            <span className='max-w-[45%] shrink-0 truncate rounded bg-fc-100 px-1.5 py-0.5 text-[11px] text-main'>{t('panel.based_on', { name: contextLabel })}</span>
          </Tooltip>
        ) : null}
        {statusChip}
        <Button type='text' size='small' icon={<CloseOutlined />} onClick={onClose} aria-label={t('panel.close')} />
      </div>

      {/* Before the first ask, say what this does rather than sit blank — one
          line, not a wall of canned questions: this is the slim surface. */}
      {!hasBody && <div className='px-4 py-3 text-[12px] leading-relaxed text-hint'>{t('panel.intro')}</div>}

      {hasBody && (
        <div className='max-h-[280px] overflow-y-auto px-4 py-3'>
          <div className='flex min-h-[64px] max-w-[1120px] flex-col gap-2'>
            {/* Running: the assistant's own sentence about what it is doing now,
                with the tallies underneath as the quieter running total. */}
            {running && (
              <div className='flex items-start gap-2' role='status' aria-live='polite'>
                <Spin indicator={<LoadingOutlined spin className='text-[12px]' />} size='small' className='mt-0.5' aria-label={t('panel.running')} />
                <div className='min-w-0'>
                  <div className='text-[12px] font-medium text-main'>{run.activity || t('panel.understanding')}</div>
                  {evidence && <div className='mt-0.5 text-[11px] text-hint'>{evidence}</div>}
                </div>
              </div>
            )}

            {/* The answer, and — as the card's own footer — what became of it.
                Bound together so the line saying "your box was overwritten"
                cannot drift away from the thing that overwrote it. It stays on
                screen, dimmed, while a follow-up refines it. */}
            {run.value && (
              <div className={`overflow-hidden rounded fc-border border-antd ${running ? 'opacity-60' : ''}`}>
                <pre className='m-0 overflow-x-auto whitespace-pre-wrap break-words bg-fc-100 px-3 py-2 font-mono text-[12px] text-title'>{run.value}</pre>
                {run.explanation && (
                  <div className='border-0 border-t border-solid border-antd px-3 py-2 text-[12px] leading-relaxed text-main'>
                    <div className='whitespace-pre-wrap'>{run.explanation}</div>
                  </div>
                )}
                {settled && (
                  <div className='flex flex-wrap items-center gap-1 border-0 border-t border-solid border-antd bg-primary/10 px-3 py-1.5 text-[12px]' role='status' aria-live='polite'>
                    {filled ? (
                      <>
                        <CheckCircleFilled className='text-[12px] text-primary' />
                        <span className='mr-auto pl-1 text-primary'>{t('panel.written_back')}</span>
                        <Button
                          type='text'
                          size='small'
                          icon={<UndoOutlined />}
                          onClick={onUndo}
                        >
                          {t('panel.undo')}
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className='mr-auto text-main'>{value ? t('panel.field_changed') : t('panel.restored')}</span>
                        {/* Re-filling is a local write, not another model run:
                            asking again could return a different query. */}
                        <Button
                          type='text'
                          size='small'
                          onClick={() => latestAdopt.current(run.value as string)}
                        >
                          {t('panel.refill')}
                        </Button>
                      </>
                    )}
                    {/* The actions belong to the result, next to the undo that
                        also acts on it — not stacked in front of the input. */}
                    <Button
                      type='text'
                      size='small'
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipBoard(run.value as string)}
                    >
                      {t('panel.copy')}
                    </Button>
                    <Button type='text' size='small' icon={<RedoOutlined />} onClick={() => ask(lastSent)}>
                      {t('panel.regenerate')}
                    </Button>
                    <Button type='text' size='small' icon={<SwapOutlined />} onClick={() => ask(t('panel.another_way_prompt'))}>
                      {t('panel.another_way')}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* A question is not a failure. Show it as one, and the user is left
                wondering what went wrong instead of just answering. */}
            {awaitingAnswer && !running && (
              <div className='border-0 border-l-2 border-solid border-primary bg-primary/10 px-3 py-2'>
                <div className='whitespace-pre-wrap text-[13px] leading-relaxed text-title'>{run.question}</div>
                <div className='mt-1 text-[11px] text-hint'>{t('panel.answer_below')}</div>
              </div>
            )}

            {run.phase === 'stopped' && (
              <div className='border-0 border-l-2 border-solid border-antd bg-fc-100 px-3 py-2 text-[12px] text-main'>{t('panel.stopped_hint')}</div>
            )}

            {/* Nothing usable came back, but the request did complete. */}
            {run.phase === 'done' && !run.value && !run.question && (
              <div className='border-0 border-l-2 border-solid border-antd bg-fc-100 px-3 py-2'>
                <div className='flex items-start gap-2'>
                  <div className='min-w-0 flex-1'>
                    <div className='text-[12px] font-medium text-title'>{t('panel.nothing_delivered')}</div>
                    {run.explanation && <div className='mt-1 whitespace-pre-wrap text-[12px] leading-relaxed text-main'>{run.explanation}</div>}
                  </div>
                  <Button size='small' icon={<RedoOutlined />} onClick={() => ask(lastSent)}>
                    {t('panel.regenerate')}
                  </Button>
                </div>
              </div>
            )}

            {/* The request itself failed — a different thing from the assistant
                looking and finding nothing, and it takes a different fix. */}
            {run.phase === 'failed' && (
              <div className='border-0 border-l-2 border-solid border-error bg-fc-100 px-3 py-2' role='status' aria-live='polite'>
                <div className='flex items-start gap-2'>
                  <div className='min-w-0 flex-1'>
                    <div className='text-[12px] font-medium text-title'>{run.errorTitle || t('panel.failed_title')}</div>
                    <div className='mt-1 whitespace-pre-wrap text-[12px] leading-relaxed text-main'>
                      {run.needsModelConfig ? t('panel.no_model_hint') : run.explanation || t('panel.failed_hint')}
                    </div>
                  </div>
                  {lastSent && (
                    <Button size='small' icon={<RedoOutlined />} onClick={() => ask(lastSent)}>
                      {t('panel.retry')}
                    </Button>
                  )}
                </div>
                {/* The raw failure exists to be pasted into a ticket, not read:
                    available on demand, never the first thing on screen. */}
                {run.error && (
                  <div className='mt-2'>
                    <Button type='link' size='small' className='h-auto p-0 text-[11px]' onClick={() => setShowError((previous) => !previous)}>
                      {t('panel.error_detail')}
                    </Button>
                    {showError && <pre className='m-0 mt-1 whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed text-hint'>{run.error}</pre>}
                  </div>
                )}
              </div>
            )}

            {/* Settled: the tallies stop being progress and become a footnote. */}
            {settled && !running && evidence && <div className='text-[11px] text-hint'>{t('panel.verified_by', { detail: evidence })}</div>}
          </div>
        </div>
      )}

      <div className='flex items-center gap-2 px-4 py-2'>
        <Input
          ref={inputRef}
          className='min-w-0 max-w-[720px] flex-1'
          size='small'
          value={question}
          disabled={running}
          placeholder={placeholder}
          onChange={(event) => setQuestion(event.target.value)}
          onPressEnter={() => send(question)}
        />
        {running ? (
          <Button size='small' onClick={stop}>
            {t('panel.stop')}
          </Button>
        ) : (
          <Button size='small' type='primary' disabled={!question.trim()} onClick={() => send(question)}>
            {t('panel.send')}
          </Button>
        )}
      </div>
    </div>
  );
}
