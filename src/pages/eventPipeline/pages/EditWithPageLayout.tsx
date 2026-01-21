import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import _ from 'lodash';

import PageLayout from '@/components/pageLayout';

import { NS } from '../constants';
import Edit from './Edit';

export default function EditWithPageLayout() {
  const { t } = useTranslation(NS);
  const params = useParams<{
    id: string;
  }>();

  return (
    <PageLayout title={t('title')}>
      <div className='n9e'>{params.id && <Edit id={_.toNumber(params.id)} />}</div>
    </PageLayout>
  );
}
