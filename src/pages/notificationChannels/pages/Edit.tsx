import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { Spin, Space, message } from 'antd';
import { ApiOutlined } from '@ant-design/icons';
import _ from 'lodash';

import PageLayout from '@/components/pageLayout';

import { NS, getChannelTypeMeta } from '../constants';
import { getItem, putItem, postItems } from '../services';
import { ChannelItem } from '../types';
import { normalizeInitialValues, normalizeFormValues } from '../utils/normalizeValues';
import Form from './Form';

export default function Add() {
  const { t } = useTranslation(NS);
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { search } = useLocation();
  const { mode } = queryString.parse(search);
  const [data, setData] = useState<ChannelItem>();
  const ident = (data?.ident as string) || 'callback';
  const typeMeta = getChannelTypeMeta(ident);

  useEffect(() => {
    if (id) {
      getItem(_.toNumber(id))
        .then((res) => {
          setData(normalizeInitialValues(res));
        })
        .catch(() => {
          setData(undefined);
        });
    }
  }, []);

  return (
    <PageLayout
      title={
        <Space className='ml-2'>
          {typeMeta.logo ? <img src={typeMeta.logo} alt={ident} height={18} /> : <ApiOutlined />}
          {typeMeta.label}
        </Space>
      }
      showBack
    >
      <div className='n9e'>
        {data ? (
          <Form
            initialValues={data}
            onOk={(values) => {
              if (mode === 'clone') {
                postItems([_.omit(normalizeFormValues(values), ['id']) as ChannelItem]).then(() => {
                  message.success(t('common:success.add'));
                  history.push({
                    pathname: `/${NS}`,
                  });
                });
              } else {
                putItem(normalizeFormValues(values)).then(() => {
                  message.success(t('common:success.add'));
                  history.push({
                    pathname: `/${NS}`,
                  });
                });
              }
            }}
          />
        ) : (
          <div>
            <Spin spinning />
          </div>
        )}
      </div>
    </PageLayout>
  );
}
