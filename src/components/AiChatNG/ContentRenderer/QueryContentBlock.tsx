import React from 'react';
import { Button, Space, Tooltip, message as antdMessage } from 'antd';
import { CopyOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import PromQLInput from '@/components/PromQLInput';
import { copy2ClipBoard } from '@/utils';

export default function QueryContentBlock(props: { query: string; onExecute?: () => void }) {
  const { t } = useTranslation('AiChat');
  const { query, onExecute } = props;
  const canExecute = Boolean(onExecute);

  return (
    <div className='border border-fc-200 rounded-lg p-2'>
      <PromQLInput value={query} readonly />
      <div
        className='my-2'
        style={{
          borderBottom: '1px solid var(--fc-fill-3)',
        }}
      />
      <Space>
        <Button
          size='small'
          icon={<CopyOutlined />}
          onClick={() => {
            copy2ClipBoard(query);
            antdMessage.success(t('query.copied'));
          }}
        >
          {t('query.copy')}
        </Button>
        <Tooltip title={!canExecute ? t('query.execute_disabled') : undefined}>
          <Button
            size='small'
            icon={<PlayCircleOutlined />}
            type='primary'
            disabled={!canExecute}
            onClick={() => {
              onExecute?.();
            }}
          >
            {t('query.execute')}
          </Button>
        </Tooltip>
      </Space>
    </div>
  );
}

