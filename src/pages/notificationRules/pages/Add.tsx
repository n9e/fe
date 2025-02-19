import React from 'react';
import { useTranslation } from 'react-i18next';

import PageLayout from '@/components/pageLayout';

import { NS } from '../constants';
import Form from './Form';

export default function Add() {
  const { t } = useTranslation(NS);

  return (
    <PageLayout title={t('title')} showBack backPath={`/${NS}`}>
      <div className='n9e'>
        <Form />
      </div>
    </PageLayout>
  );
}
