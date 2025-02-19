import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams } from 'react-router-dom';
import { Spin, message } from 'antd';
import _ from 'lodash';

import PageLayout from '@/components/pageLayout';

import { NS } from '../constants';
import { getItem } from '../services';
import { ChannelItem } from '../types';
import normalizeFormValues from '../utils/normalizeFormValues';
import Form from './Form';

export default function Add() {
  const { t } = useTranslation(NS);
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [data, setData] = useState<ChannelItem>();

  useEffect(() => {
    if (id) {
      getItem(_.toNumber(id)).then((res) => {
        setData(res);
      });
    }
  }, []);

  return (
    <PageLayout title={t('title')} showBack backPath={`/${NS}`}>
      <div className='n9e'>
        {data ? (
          <Form
            initialValues={data}
            onOk={(values) => {
              // post(normalizeFormValues(values)).then(() => {
              //   message.success(t('common:success.add'));
              //   history.push({
              //     pathname: `/${NS}`,
              //   });
              // });
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
