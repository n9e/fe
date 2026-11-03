import React from 'react';
import { Button, message as antdMessage } from 'antd';
import { ConsoleSqlOutlined, CopyOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import PromQLInput from '@/components/PromQLInput';
import { copy2ClipBoard } from '@/utils';
import { NAME_SPACE } from '../constants';
import ContentCard from './ContentCard';

export default function QueryContentBlock(props: { query: string }) {
  const { t } = useTranslation(NAME_SPACE);
  const { query } = props;

  return (
    <ContentCard icon={<ConsoleSqlOutlined />} title={t('query.title')} bodyClassName='p-3'>
      <PromQLInput value={query} readonly />
      <div
        className='my-2'
        style={{
          borderBottom: '1px solid var(--fc-fill-3)',
        }}
      />
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
    </ContentCard>
  );
}
