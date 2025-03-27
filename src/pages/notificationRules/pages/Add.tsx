import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { message } from 'antd';

import PageLayout from '@/components/pageLayout';

import { NS } from '../constants';
import { postItems } from '../services';
import Form from './Form';

export default function Add() {
  const { t } = useTranslation(NS);
  const history = useHistory();

  return (
    <PageLayout title={t('title')} showBack backPath={`/${NS}`}>
      <div className='n9e'>
        <Form
          onOk={(values) => {
            postItems([values]).then(() => {
              message.success(t('common:success.add'));
              history.push({
                pathname: `/${NS}`,
              });
            });
          }}
        />
      </div>
    </PageLayout>
  );
}
