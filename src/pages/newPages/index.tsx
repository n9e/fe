import { SettingOutlined } from '@ant-design/icons';
import PageLayout from '@/components/pageLayout';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import { useTranslation } from 'react-i18next';
import React from 'react';

export default function NewPages() {
  const { t } = useTranslation('alertRules');
  return (
    <PageLayout title={t('title')} icon={<SettingOutlined />}>
      <div className='alert-rules-container'>=====测试=====</div>
    </PageLayout>
  );
}
