import React from 'react';
import { Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';

import { NAME_SPACE } from '@/components/AiChatNG/constants';

interface AiQueryDockTriggerProps {
  open: boolean;
  onClick: () => void;
}

/** The FlashAI mark inside a query box that opens and closes its dock. */
export function AiQueryDockTrigger({ open, onClick }: AiQueryDockTriggerProps) {
  const { t } = useTranslation(NAME_SPACE);
  return (
    <Tooltip title={t('dock.open')}>
      <button
        type='button'
        aria-label={t('dock.open')}
        aria-pressed={open}
        className={`inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded border-0 p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary ${
          open ? 'bg-fc-200/80' : 'bg-transparent hover:bg-fc-200/80'
        }`}
        onClick={onClick}
      >
        <img src='/image/ai-chat/ai.gif' alt='' className='h-[14px] w-[14px]' />
      </button>
    </Tooltip>
  );
}
