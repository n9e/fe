import React from 'react';
import { useTranslation } from 'react-i18next';

import PageLayout from '@/components/pageLayout';

import { NS } from '../constants';
import List from './List';

export default function ListWithPageLayout() {
  const { t } = useTranslation(NS);
  return (
    <PageLayout title={t('title')}>
      <div className='n9e'>
        <List />
      </div>
    </PageLayout>
  );
}
