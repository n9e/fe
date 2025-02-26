import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { Spin, message } from 'antd';
import _ from 'lodash';

import PageLayout from '@/components/pageLayout';

import { NS } from '../constants';
import { getItem, putItem, RuleItem, postItems } from '../services';
import Form from './Form';

export default function Add() {
  const { t } = useTranslation(NS);
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { search } = useLocation();
  const { mode } = queryString.parse(search);
  const [data, setData] = useState<RuleItem>();

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
              if (mode === 'clone') {
                postItems([_.omit(values, ['id']) as RuleItem]).then(() => {
                  message.success(t('common:success.add'));
                  history.push({
                    pathname: `/${NS}`,
                  });
                });
              } else {
                putItem(values).then(() => {
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
