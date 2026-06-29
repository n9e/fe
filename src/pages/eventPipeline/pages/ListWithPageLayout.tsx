import React from 'react';
import { useTranslation } from 'react-i18next';

import PageLayout from '@/components/pageLayout';

import { NS } from '../constants';
import List from './List';

export default function ListWithPageLayout() {
  const { t } = useTranslation(NS);
  return (
    <PageLayout title={t('title')} doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/event-pipelines/'>
      <div className='n9e'>
        <List />
      </div>
    </PageLayout>
  );
}
