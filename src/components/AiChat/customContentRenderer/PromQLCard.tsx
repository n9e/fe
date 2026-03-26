import React from 'react';
import { Button, Space } from 'antd';
import { CopyOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { copy2ClipBoard } from '@/utils';
import PromQLInput from '@/components/PromQLInput';

import { IAiChatMessage, IAiChatMessageResponse } from '../types';

interface IQueryBlockProps {
  onExecuteQuery: (query: string) => void;
}

export default function PromQLCard({ response, onExecuteQuery }: { response: IAiChatMessageResponse; message: IAiChatMessage } & IQueryBlockProps) {
  const { t } = useTranslation('AiChat');
  return (
    <div className='border border-fc-200 rounded-lg p-2'>
      <PromQLInput value={response.content} readonly />
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
            copy2ClipBoard(response.content);
          }}
        >
          {t('customContentRenderer.query.btn_copy')}
        </Button>
        <Button
          size='small'
          icon={<PlayCircleOutlined />}
          type='primary'
          onClick={() => {
            onExecuteQuery(response.content);
          }}
        >
          {t('customContentRenderer.query.btn_run')}
        </Button>
      </Space>
    </div>
  );
}
