import React from 'react';
import { CheckCircleFilled, CloseCircleFilled, ThunderboltOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { ActionResponse } from '@flashcatcloud/ai-kit/actions';

import { NAME_SPACE } from '../constants';
import { IAiChatPageActionRequest } from '../types';
import { uiActionRuntime } from '../uiActionRuntime';
import ContentCard from './ContentCard';

/**
 * The model asked the page to run one of the actions it declared.
 *
 * The card only reports. Running happens in the panel, once, on the turn that
 * produced the request; a card rendered from history shows what the request
 * was and, if this panel ran it, how it went — it never offers to run it
 * again, because the page it was written for may not be the page on screen.
 */
export default function PageActionBlock({ request, outcome }: { request?: IAiChatPageActionRequest; outcome?: ActionResponse }) {
  const { t } = useTranslation(NAME_SPACE);

  if (!request?.call_id || !request.name) {
    return (
      <ContentCard icon={<ThunderboltOutlined />} title={t('page_action.title')} bodyClassName='p-3'>
        <div className='text-sm text-error'>{t('page_action.malformed')}</div>
      </ContentCard>
    );
  }

  // Read at render: the registry belongs to whichever page is mounted now.
  const registered = uiActionRuntime.has(request.name);

  return (
    <ContentCard icon={<ThunderboltOutlined />} title={t('page_action.title')} bodyClassName='p-3'>
      {/* The description was written for the model; the user reads the arguments. */}
      <div className='ai-chat-page-action-name font-mono text-xs text-hint'>{request.name}</div>
      <Args args={request.args} />
      <div className='mt-2 text-sm'>
        {outcome ? (
          <Outcome outcome={outcome} />
        ) : registered ? (
          <span className='text-hint'>{t('page_action.not_run')}</span>
        ) : (
          <span className='text-error'>{t('page_action.unsupported', { name: request.name })}</span>
        )}
      </div>
    </ContentCard>
  );
}

function Args({ args }: { args?: Record<string, unknown> }) {
  const entries = Object.entries(args ?? {}).filter(([, value]) => value != null);
  if (!entries.length) return null;
  return (
    <dl className='mt-2 space-y-1'>
      {entries.map(([key, value]) => (
        <div key={key} className='flex gap-2 text-sm'>
          <dt className='shrink-0 text-hint'>{key}</dt>
          <dd className='m-0 min-w-0 break-all font-mono text-main'>{typeof value === 'string' ? value : JSON.stringify(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function Outcome({ outcome }: { outcome: ActionResponse }) {
  const { t } = useTranslation(NAME_SPACE);
  if (outcome.ok) {
    return (
      <span className='text-success'>
        <CheckCircleFilled className='mr-1' />
        {t('page_action.done')}
      </span>
    );
  }
  if (outcome.status === 'declined') {
    return <span className='text-warning'>{outcome.message || t('page_action.declined')}</span>;
  }
  return (
    <span className='text-error'>
      <CloseCircleFilled className='mr-1' />
      {t('page_action.failed')}
      {outcome.message ? `：${outcome.message}` : ''}
    </span>
  );
}
