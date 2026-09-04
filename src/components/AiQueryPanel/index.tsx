import React, { useEffect, useRef, useState } from 'react';
import { Button, Input, Spin, Tag, Tooltip } from 'antd';
import { CheckCircleFilled, CloseOutlined, LoadingOutlined, RedoOutlined, SwapOutlined, UndoOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

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
 */

export interface AiQueryPanelProps {
  /** Where the user is, plus what the page knows — data source, above all. */
  pageFrom: IAiChatPageInfo;
  /** Named in the header so it is clear what the answer was checked against. */
  contextLabel?: string;
  placeholder?: string;
  /** Writes the value into the field. Called on arrival, and again on redo. */
  onAdopt: (value: string) => void;
  /** Puts back whatever the field held before this panel touched it. */
  onUndo: () => void;
  onClose: () => void;
}

export default function AiQueryPanel(props: AiQueryPanelProps) {
  const { t } = useTranslation(NAME_SPACE);
  const { pageFrom, contextLabel, placeholder, onAdopt, onUndo, onClose } = props;
  const { run, ask } = useAiQueryRun({ pageFrom, t });

  const [question, setQuestion] = useState('');
  const [asked, setAsked] = useState('');
  // Two different questions: `adopted` drives the undo row and is cleared when
  // the user undoes; `written` remembers what we already put in the field, so
  // undoing does not immediately trip the effect below into writing it again.
  const [adopted, setAdopted] = useState<string>();
  const written = useRef<string>();
  const inputRef = useRef<any>();
  const latestAdopt = useRef(onAdopt);
  latestAdopt.current = onAdopt;

  useEffect(() => {
    inputRef.current?.focus?.();
  }, []);

  // Adopting is a side effect of an answer arriving, not of a render. A new run
  // forgets what was written, so asking again adopts even an identical answer.
  useEffect(() => {
    if (run.phase === 'running') {
      written.current = undefined;
      return;
    }
    if (run.phase === 'done' && run.value && run.value !== written.current) {
      written.current = run.value;
      latestAdopt.current(run.value);
      setAdopted(run.value);
    }
  }, [run.phase, run.value]);

  // A new question renames the panel and clears the box; re-asking does not.
  // "Another way" sends an instruction, but the panel still belongs to the
  // question the user asked — and that is what Regenerate must resend.
  const askNew = (text: string) => {
    const next = text.trim();
    if (!next) return;
    setAsked(next);
    setQuestion('');
    ask(next);
  };

  const running = run.phase === 'running';
  const header = asked || t('panel.untitled');

  return (
    <div className='mb-3 overflow-hidden rounded-md fc-border border-primary bg-fc-100 shadow-mf'>
      <div className='flex items-center gap-2 border-0 border-b border-solid border-antd bg-primary-pale px-3 py-2'>
        <span className='min-w-0 flex-1 truncate font-medium'>
          {header}
          {contextLabel ? <span className='ml-2 text-[11px] font-normal text-hint'>· {t('panel.based_on', { name: contextLabel })}</span> : null}
        </span>
        {running ? <Tag color='processing'>{t('panel.running')}</Tag> : null}
        {run.phase === 'done' && adopted ? <Tag color='success'>{t('panel.adopted')}</Tag> : null}
        {run.phase === 'failed' ? <Tag color='error'>{t('panel.failed')}</Tag> : null}
        <Button type='text' size='small' icon={<CloseOutlined />} onClick={onClose} aria-label={t('panel.close')} />
      </div>

      {/* Only this scrolls. The actions below stay reachable however long the
          assistant's explanation runs. */}
      <div className='max-h-[240px] overflow-y-auto px-3 py-2'>
        {run.steps.length > 0 && (
          <ul className='m-0 flex list-none flex-col gap-1 p-0'>
            {run.steps.map((step, index) => (
              <li key={`${step.label}-${index}`} className='flex items-start gap-2'>
                {step.done ? <CheckCircleFilled className='mt-1 text-success' /> : <Spin indicator={<LoadingOutlined spin />} size='small' className='mt-1' />}
                <span className={step.done ? '' : 'text-hint'}>{step.label}</span>
              </li>
            ))}
          </ul>
        )}

        {run.value && (
          <div className='mt-2 overflow-hidden rounded fc-border border-antd'>
            <div className='overflow-x-auto whitespace-pre bg-fc-200 px-3 py-2 font-mono text-[12px]'>{run.value}</div>
            {run.explanation && <div className='border-0 border-t border-solid border-antd px-3 py-2 text-main'>{run.explanation}</div>}
          </div>
        )}

        {/* Nothing delivered: say what was looked at and what came back, rather
            than offering an expression nobody ran. */}
        {run.phase === 'failed' && (
          <div className='mt-2 rounded fc-border border-error px-3 py-2'>
            <div className='font-medium'>{t('panel.nothing_delivered')}</div>
            {run.explanation && <div className='mt-1 text-main'>{run.explanation}</div>}
            {run.error && <div className='mt-1 text-hint'>{run.error}</div>}
          </div>
        )}
        {run.phase === 'done' && !run.value && (
          <div className='mt-2 rounded fc-border border-antd px-3 py-2 text-main'>
            <div className='font-medium text-title'>{t('panel.nothing_delivered')}</div>
            {run.explanation && <div className='mt-1'>{run.explanation}</div>}
          </div>
        )}

        {adopted && (
          <div className='mt-2 flex items-center gap-2 rounded bg-primary-pale px-3 py-2 text-primary'>
            <span className='flex-1'>{t('panel.written_back')}</span>
            <Button
              type='text'
              size='small'
              icon={<UndoOutlined />}
              onClick={() => {
                onUndo();
                setAdopted(undefined);
              }}
            >
              {t('panel.undo')}
            </Button>
          </div>
        )}
      </div>

      <div className='flex flex-wrap items-center gap-2 border-0 border-t border-solid border-antd bg-fc-100 px-3 py-2'>
        <Tooltip title={!asked ? t('panel.ask_first') : undefined}>
          <Button size='small' icon={<RedoOutlined />} disabled={!asked || running} onClick={() => ask(asked)}>
            {t('panel.regenerate')}
          </Button>
        </Tooltip>
        <Button size='small' icon={<SwapOutlined />} disabled={!asked || running} onClick={() => ask(t('panel.another_way_prompt'))}>
          {t('panel.another_way')}
        </Button>
        <Input
          ref={inputRef}
          className='min-w-[180px] flex-1'
          size='small'
          value={question}
          disabled={running}
          placeholder={placeholder ?? t('panel.follow_up_placeholder')}
          onChange={(event) => setQuestion(event.target.value)}
          onPressEnter={() => askNew(question)}
        />
        <Button size='small' type='primary' disabled={running || !question.trim()} onClick={() => askNew(question)}>
          {t('panel.send')}
        </Button>
      </div>
    </div>
  );
}
