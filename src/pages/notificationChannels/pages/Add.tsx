import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { message, Space } from 'antd';
import queryString from 'query-string';

import PageLayout from '@/components/pageLayout';

import { NS, NOTIFICATION_CHANNEL_TYPES, DEFAULT_VALUES } from '../constants';
import { postItems } from '../services';
import { ChannelItem } from '../types';
import { normalizeFormValues } from '../utils/normalizeValues';
import Form from './Form';

export default function Add() {
  const { t } = useTranslation(NS);
  const history = useHistory();
  const query = queryString.parse(useLocation().search);
  const ident = (query.ident as string) || 'callback';
  const identConfig = NOTIFICATION_CHANNEL_TYPES[ident] ? NOTIFICATION_CHANNEL_TYPES[ident] : NOTIFICATION_CHANNEL_TYPES['callback'];

  return (
    <PageLayout
      title={
        <Space className='ml-2'>
          <img src={identConfig.logo} alt={ident} height={18} />
          {t(`types.${ident}`)}
        </Space>
      }
      showBack
      backPath={`/${NS}`}
      doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v8/usecase/media/'
    >
      <div className='n9e'>
        <Form
          initialValues={
            {
              ...(DEFAULT_VALUES as any),
              ...(identConfig.default_values || {}),
              ident,
              request_type: identConfig.type,
            } as ChannelItem
          }
          onOk={(values) => {
            postItems([normalizeFormValues(values)]).then(() => {
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
