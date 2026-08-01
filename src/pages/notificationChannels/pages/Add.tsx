import React from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import { message, Space } from 'antd';
import { ApiOutlined } from '@ant-design/icons';
import queryString from 'query-string';

import PageLayout from '@/components/pageLayout';

import { NS, getNotificationChannelTypes, getChannelTypeMeta, DEFAULT_VALUES } from '../constants';
import { postItems } from '../services';
import { ChannelItem } from '../types';
import { normalizeFormValues, normalizeInitialValues } from '../utils/normalizeValues';
import Form from './Form';

export default function Add() {
  const { t } = useTranslation(NS);
  const history = useHistory();
  const query = queryString.parse(useLocation().search);
  const ident = (query.ident as string) || 'callback';
  const channelTypes = getNotificationChannelTypes();
  // 默认值仍回落到 callback（未知 ident 只可能来自手敲 URL，给一份通用 HTTP 默认值是合理的），
  // 但页面标题必须如实展示，不能顶着 Callback 的图标冒充已知类型
  const identConfig = channelTypes[ident] ? channelTypes[ident] : channelTypes['callback'];
  const typeMeta = getChannelTypeMeta(ident);

  return (
    <PageLayout
      title={
        <Space className='ml-2'>
          {typeMeta.logo ? <img src={typeMeta.logo} alt={ident} height={18} /> : <ApiOutlined />}
          {typeMeta.label}
        </Space>
      }
      showBack
      backPath={`/${NS}`}
    >
      <div className='n9e'>
        <Form
          initialValues={normalizeInitialValues({
            ...(DEFAULT_VALUES as any),
            ...(identConfig.default_values || {}),
            ident,
            request_type: identConfig.type,
          } as ChannelItem)}
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
