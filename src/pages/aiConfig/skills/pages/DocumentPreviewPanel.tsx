import React from 'react';
import { useTranslation } from 'react-i18next';
import { Empty, Radio, Space, Spin } from 'antd';
import { CodeOutlined, EyeOutlined } from '@ant-design/icons';

import Markdown from '@/components/Markdown';

import { NS } from '../constants';

interface Props {
  title: string;
  content?: string;
  loading?: boolean;
  isMarkdown: boolean;
  previewMode: 'formatted' | 'code';
  onPreviewModeChange: (mode: 'formatted' | 'code') => void;
  extra?: React.ReactNode;
}

export default function DocumentPreviewPanel(props: Props) {
  const { t } = useTranslation(NS);
  const { title, content, loading, isMarkdown, previewMode, onPreviewModeChange, extra } = props;

  return (
    <div className='w-full min-w-0 best-looking-scroll pr-2'>
      <div className='flex justify-between items-center fc-toolbar mb-2 gap-3'>
        <div className='text-title text-l2 break-all'>{title}</div>
        <Space>
          {extra}
          {isMarkdown && (
            <Radio.Group
              size='small'
              value={previewMode}
              onChange={(event) => {
                onPreviewModeChange(event.target.value);
              }}
            >
              <Radio.Button value='formatted'>
                <EyeOutlined />
              </Radio.Button>
              <Radio.Button value='code'>
                <CodeOutlined />
              </Radio.Button>
            </Radio.Group>
          )}
        </Space>
      </div>
      <div className='bg-fc-100 fc-border rounded-lg p-4 min-h-[240px]'>
        <Spin spinning={loading}>
          {!content ? (
            <div className='min-h-[208px] flex items-center justify-center'>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('document_empty')} />
            </div>
          ) : isMarkdown && previewMode === 'formatted' ? (
            <div className='max-h-[calc(100vh-280px)] best-looking-scroll'>
              <Markdown content={content} />
            </div>
          ) : (
            <div className='max-h-[calc(100vh-280px)] best-looking-scroll'>
              <pre className='whitespace-pre-wrap break-all'>{content}</pre>
            </div>
          )}
        </Spin>
      </div>
    </div>
  );
}
