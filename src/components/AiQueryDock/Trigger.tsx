import React from 'react';
import { Tooltip } from 'antd';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { NAME_SPACE } from '@/components/AiChatNG/constants';

interface AiQueryDockTriggerProps {
  open: boolean;
  onClick: () => void;
}

/** The orb beside a query box that opens and closes its dock. */
export function AiQueryDockTrigger({ open, onClick }: AiQueryDockTriggerProps) {
  const { t } = useTranslation(NAME_SPACE);
  return (
    <Tooltip title={t('dock.open')}>
      <button
        type='button'
        aria-label={t('dock.open')}
        aria-pressed={open}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border-0 p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
          open ? 'bg-fc-200/80 text-primary' : 'bg-transparent text-primary/80 hover:bg-fc-200/80 hover:text-primary'
        }`}
        onClick={onClick}
      >
        <Sparkles size={16} strokeWidth={1.75} aria-hidden='true' />
      </button>
    </Tooltip>
  );
}
