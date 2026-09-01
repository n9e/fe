import React from 'react';
import { Button, Space } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, ThunderboltOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ActionResponse } from '@flashcatcloud/ai-kit/actions';

import { NAME_SPACE } from '../constants';
import { uiActionRuntime } from '../uiActionRuntime';
import { UIActionCallSegment } from '../uiActionMessage';
import ContentCard from './ContentCard';

/**
 * An action the assistant is proposing to run on the page behind the chat.
 *
 * The card is the gate. Nothing here runs on arrival: the model can only put
 * the proposal on screen, and the user's click is what executes it — the same
 * shape as the query block, where the assistant writes the query and the user
 * decides whether to run it.
 */
export default function UIActionBlock({ segment }: { segment: UIActionCallSegment }) {
  const { t } = useTranslation(NAME_SPACE);
  const [running, setRunning] = React.useState(false);
  const [response, setResponse] = React.useState<ActionResponse | null>(null);

  const call = segment.call;
  // Read at render: the actions belong to whichever page is mounted right now,
  // which is not necessarily the page this reply was written on.
  const registered = Boolean(call && uiActionRuntime.has(call.name));

  const handleExecute = async () => {
    if (!call) return;
    setRunning(true);
    setResponse(
      await uiActionRuntime.execute({
        // A new id per click: the runtime keeps one answer per call id so a
        // replayed event cannot run a write twice, which would also turn a
        // deliberate re-run into a replay of the first result.
        callId: `${call.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: call.name,
        args: call.args,
      }),
    );
    setRunning(false);
  };

  return (
    <ContentCard icon={<ThunderboltOutlined />} title={t('ui_action.title')} bodyClassName='p-3'>
      {!segment.closed ? (
        // Still streaming. Half a JSON object is not something to offer.
        <div className='text-sm text-hint'>{t('ui_action.generating')}</div>
      ) : !call ? (
        <>
          <div className='text-sm text-error'>{t('ui_action.invalid_json')}</div>
          <RawBlock content={segment.raw} />
        </>
      ) : (
        <>
          <div className='font-mono text-sm text-title'>{call.name}</div>
          {!registered && <div className='mt-1 text-sm text-error'>{t('ui_action.unsupported', { name: call.name })}</div>}
          <div className='mt-2 text-xs text-hint'>{t('ui_action.args')}</div>
          <RawBlock content={JSON.stringify(call.args, null, 2)} />
          <Space className='mt-3'>
            <Button size='small' type='primary' icon={<ThunderboltOutlined />} loading={running} disabled={!registered} onClick={handleExecute}>
              {running ? t('ui_action.executing') : t('ui_action.execute')}
            </Button>
            {response && <Outcome response={response} />}
          </Space>
          {response?.ok && response.result != null && <RawBlock content={JSON.stringify(response.result, null, 2)} />}
        </>
      )}
    </ContentCard>
  );
}

function Outcome({ response }: { response: ActionResponse }) {
  const { t } = useTranslation(NAME_SPACE);

  if (response.ok) {
    return (
      <span className='text-sm text-success'>
        <CheckCircleFilled className='mr-1' />
        {t('ui_action.succeeded')}
      </span>
    );
  }

  return (
    <span className='text-sm text-error'>
      <CloseCircleFilled className='mr-1' />
      {t('ui_action.failed')}
      {response.message ? `：${response.message}` : ''}
    </span>
  );
}

function RawBlock({ content }: { content: string }) {
  return <pre className='mt-1 max-h-48 overflow-auto rounded-lg bg-fc-50 p-2 text-xs text-main'>{content}</pre>;
}
