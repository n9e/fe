import React from 'react';
import { Button, Space, Tooltip, message as antdMessage } from 'antd';
import { ConsoleSqlOutlined, CopyOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import PromQLInput from '@/components/PromQLInput';
import { copy2ClipBoard } from '@/utils';
import { NAME_SPACE } from '../constants';
import ContentCard from './ContentCard';

export default function QueryContentBlock(props: { query: string; onExecute?: () => void }) {
  const { t } = useTranslation(NAME_SPACE);
  const { query, onExecute } = props;
  const canExecute = Boolean(onExecute);

  return (
    <ContentCard icon={<ConsoleSqlOutlined />} title={t('query.title')} bodyClassName='p-3'>
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
    </ContentCard>
  );
}
