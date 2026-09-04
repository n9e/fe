import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, Spin, Tooltip } from 'antd';
import type { InputRef } from 'antd';
import { CheckCircleFilled, CloseOutlined, CopyOutlined, LoadingOutlined, RedoOutlined, UndoOutlined } from '@ant-design/icons';
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
 * Sitting in the flow costs height, and the chart pays for it. So the panel
 * shows only what the field cannot: once the query is in the box above, the box
 * is where it is read, and repeating it here would take a third of the chart to
 * say nothing new.
 *
 * The value is adopted on arrival rather than on a button, because the field it
 * writes to saves nothing by itself and Undo restores the previous value. Making
 * the user confirm buys a moment of hesitation and no safety.
 */

export interface AiQueryPanelProps {
  /** Where the user is, plus what the page knows — data source, above all. */
  pageFrom: IAiChatPageInfo;
  /** Named in the header so it is clear what the answer was checked against.
   *  Absent means no data source is chosen, and nothing can be asked yet. */
  contextLabel?: string;
  /** What the field holds right now. Lets the panel notice the user edited it
   *  by hand, rather than claiming a value it no longer put there. */
  value?: string;
  /** One example of what to ask, in this page's own terms. The only fact about
   *  the host page the panel cannot work out for itself. */
  examplePrompt: string;
  /** Writes a value into the field — the assistant's answer, or, on undo, what
   *  the field held before this run touched it. */
  onAdopt: (value: string) => void;
  onClose: () => void;
}

export default function AiQueryPanel(props: AiQueryPanelProps) {
  const { t } = useTranslation(NAME_SPACE);
  const { pageFrom, contextLabel, value, examplePrompt, onAdopt, onClose } = props;
  const { run, ask, stop } = useAiQueryRun({ pageFrom, t });

  const [question, setQuestion] = useState('');
  // The task keeps its name across follow-ups: by the third turn "用 node_exporter
  // 那个" is what was last said, not what is being worked on.
  const [task, setTask] = useState('');
  const [lastSent, setLastSent] = useState('');
  // What the field held when this run started. Undo aims here, and an answer
  // equal to it is not a change worth announcing or offering to reverse.
  const [baseline, setBaseline] = useState<string>();
  const [showError, setShowError] = useState(false);
  const written = useRef<string>();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<InputRef>(null);
  const latestAdopt = useRef(onAdopt);
  latestAdopt.current = onAdopt;

  const running = run.phase === 'running';
  const settled = run.phase !== 'idle' && !running;
  // Asked of the field itself, so a hand edit or an undo is noticed rather than
  // assumed. `written` is a separate question: the write-once guard, so undoing
  // does not trip the effect below into putting the value straight back.
  const filled = !!run.value && value === run.value;
  // The answer the user already had. Nothing was written, so there is nothing
  // to undo and nothing to boast about — but only while the field still holds
  // it; a later hand edit is a change like any other.
  const unchanged = filled && run.value === baseline;

  // Focus on open, and again when a turn ends — unless the user has moved on to
  // the query box themselves, in which case stealing focus is worse than none.
  useEffect(() => {
    if (running) return;
    const active = document.activeElement;
    if (active && active !== document.body && !rootRef.current?.contains(active)) return;
    inputRef.current?.focus({ preventScroll: true });
  }, [running]);

  // A turn that delivered nothing puts the question back in the box, so the
  // send button is the retry — and the user can sharpen it first, which is what
  // the timeout copy tells them to do anyway.
  useEffect(() => {
    if (run.phase === 'failed' || run.phase === 'stopped' || (run.phase === 'done' && !run.value && !run.question)) {
      setQuestion((current) => current || lastSent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.phase, run.value, run.question]);

  // Adopting is a side effect of an answer arriving, not of a render.
  useEffect(() => {
    if (run.phase !== 'done' || !run.value || run.value === written.current) return;
    written.current = run.value;
    // Writing the value the field already holds would arm an undo that wipes
    // the user's own text.
    if (run.value !== baseline) latestAdopt.current(run.value);
  }, [run.phase, run.value, baseline]);

  const send = (text: string) => {
    const next = text.trim();
    // The one guard, so Enter cannot go where the button will not.
    if (!next || !contextLabel) return;
    // The first thing asked names the task; answering a question the assistant
    // raised is part of that task, not a new one.
    if (!task) setTask(next);
    setLastSent(next);
    // Only when the field is not already holding our own write: otherwise a
    // third refinement would leave the user's own text unrecoverable.
    if (!filled) setBaseline(value ?? '');
    // A fresh run may legitimately deliver the same answer again — after an
    // undo, that is precisely what the user is asking for.
    written.current = undefined;
    setQuestion('');
    setShowError(false);
    ask(next);
  };

  const header = task || t('panel.untitled');
  // This turn delivered something new; any value present on the other outcomes
  // was carried forward from an earlier turn and is no longer the headline.
  const cardLeads = run.phase === 'done' && !!run.value && !run.question;
  const shown = run.value ?? run.carried;
  const placeholder = run.question ? t('panel.answer_placeholder') : task ? t('panel.follow_up_placeholder') : t('panel.first_placeholder', { example: examplePrompt });

  // The tally is only evidence when it says what it ran against.
  const tried = run.tried > 0 && contextLabel ? t('panel.tried', { count: run.tried, name: contextLabel }) : '';

  const card = (shownValue: string, lead: boolean) => (
    <div className={`overflow-hidden rounded fc-border border-antd ${lead ? '' : 'opacity-60'}`}>
      {settled && (
        <div className='flex items-center gap-1 bg-primary/10 px-3 py-1.5 text-[12px]' role='status' aria-live='polite'>
          {unchanged ? (
            <span className='mr-auto text-main'>{t('panel.unchanged')}</span>
          ) : filled ? (
            <>
              <CheckCircleFilled className='text-[12px] text-primary' />
              <span className='mr-auto pl-1 text-primary'>{t('panel.written_back')}</span>
              <Button type='text' size='small' icon={<UndoOutlined />} onClick={() => onAdopt(baseline ?? '')}>
                {t('panel.undo')}
              </Button>
            </>
          ) : (
            <>
              <span className='mr-auto text-main'>{value === baseline ? t('panel.restored') : t('panel.field_changed')}</span>
              {/* Re-filling is a local write, not another model run: asking
                  again could return a different query. */}
              <Button type='text' size='small' onClick={() => onAdopt(shownValue)}>
                {t('panel.refill')}
              </Button>
            </>
          )}
          <Tooltip title={t('panel.copy')}>
            <Button type='text' size='small' icon={<CopyOutlined />} aria-label={t('panel.copy')} onClick={() => copyToClipBoard(shownValue)} />
          </Tooltip>
          {/* Only when this card is the turn's own outcome: the blocks below
              carry their own re-run, and two of them 30px apart is a choice
              nobody should have to make. */}
          {lead && (
            <Tooltip title={t('panel.regenerate')}>
              <Button type='text' size='small' icon={<RedoOutlined />} aria-label={t('panel.regenerate')} onClick={() => send(task)} />
            </Tooltip>
          )}
        </div>
      )}
      {/* The query itself, only while the field does not hold it. When it does,
          it is already legible one row above — and repeating it costs the chart
          more height than it costs the reader effort to look up. */}
      {!filled && !unchanged && <pre className='m-0 overflow-x-auto whitespace-pre-wrap break-words border-0 border-t border-solid border-antd bg-fc-100 px-3 py-2 font-mono text-[12px] text-title'>{shownValue}</pre>}
      {run.explanation && (
        <Tooltip title={run.explanation}>
          <div className='line-clamp-2 border-0 border-t border-solid border-antd px-3 py-2 text-[12px] leading-relaxed text-main'>{run.explanation}</div>
        </Tooltip>
      )}
    </div>
  );

  const turnBlock = (() => {
    if (run.question) {
      return (
        <div className='border-0 border-l-2 border-solid border-primary bg-primary/10 px-3 py-2'>
          <div className='whitespace-pre-wrap text-[13px] leading-relaxed text-title'>{run.question}</div>
          <div className='mt-1 text-[11px] text-hint'>{t('panel.answer_below')}</div>
        </div>
      );
    }
    if (run.phase === 'stopped') {
      return <div className='border-0 border-l-2 border-solid border-antd bg-fc-100 px-3 py-2 text-[12px] text-main'>{t('panel.stopped_hint')}</div>;
    }
    if (run.phase === 'done' && !run.value && !run.question) {
      return (
        <div className='border-0 border-l-2 border-solid border-antd bg-fc-100 px-3 py-2'>
          <div className='text-[12px] font-medium text-title'>{t('panel.nothing_delivered')}</div>
          {run.explanation && <div className='mt-1 whitespace-pre-wrap text-[12px] leading-relaxed text-main'>{run.explanation}</div>}
        </div>
      );
    }
    if (run.phase === 'failed') {
      return (
        <div className='border-0 border-l-2 border-solid border-error bg-fc-100 px-3 py-2' role='status' aria-live='polite'>
          <div className='text-[12px] font-medium text-title'>{run.errorTitle || t('panel.failed_title')}</div>
          <div className='mt-1 whitespace-pre-wrap text-[12px] leading-relaxed text-main'>{run.needsModelConfig ? t('panel.no_model_hint') : t('panel.failed_hint')}</div>
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
      );
    }
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
        <Tooltip title={task}>
          <span className='min-w-0 flex-1 truncate text-[13px] font-medium text-title'>{header}</span>
        </Tooltip>
        {/* The data source decides whether the answer is right at all, so it is
            stated rather than whispered — capped, because in a 600px drawer it
            would otherwise squeeze the task name to nothing. */}
        {contextLabel ? (
          <Tooltip title={contextLabel}>
            <span className='max-w-[40%] shrink-0 truncate rounded bg-fc-100 px-1.5 py-0.5 text-[11px] text-main'>{t('panel.based_on', { name: contextLabel })}</span>
          </Tooltip>
        ) : null}
        <Button
          type='text'
          size='small'
          icon={<CloseOutlined />}
          aria-label={t('panel.close')}
          onClick={() => {
            if (running) stop();
            onClose();
          }}
        />
      </div>

      {/* Before the first ask, say what this does rather than sit blank — one
          line, not a wall of canned questions: this is the slim surface. */}
      {run.phase === 'idle' && <div className='px-4 py-3 text-[12px] leading-relaxed text-hint'>{contextLabel ? t('panel.intro') : t('panel.no_context')}</div>}

      {run.phase !== 'idle' && (
        <div className='px-4 py-3'>
          <div className='flex max-w-[1120px] flex-col gap-2'>
            {running && (
              <div className='flex items-start gap-2' role='status' aria-live='polite'>
                <Spin indicator={<LoadingOutlined spin className='text-[12px]' />} size='small' className='mt-0.5' aria-label={t('panel.running')} />
                <div className='min-w-0'>
                  <div className='text-[12px] font-medium text-main'>{run.activity || t('panel.understanding')}</div>
                  {tried && <div className='mt-0.5 text-[11px] text-hint'>{tried}</div>}
                </div>
              </div>
            )}

            {/* Whatever this turn produced leads. A card carried over from an
                earlier turn follows it, dimmed — it is context now, not news. */}
            {cardLeads && run.value && card(run.value, true)}
            {turnBlock}
            {!cardLeads && shown && settled && card(shown, false)}

            {settled && cardLeads && tried && <div className='text-[11px] text-hint'>{tried}</div>}
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
          <Button size='small' type='primary' disabled={!question.trim() || !contextLabel} onClick={() => send(question)}>
            {t('panel.send')}
          </Button>
        )}
      </div>
    </div>
  );
}
