/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
/**
 * 详情页面只是用于内置规则的展示
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import _ from 'lodash';
import PageLayout from '@/components/pageLayout';
import Form from '@/pages/alertRules/Form';
import { getPayload } from '../services';

export default function Edit() {
  const { t } = useTranslation('alertRules');
  const { search } = useLocation<any>();
  const query = queryString.parse(search);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialValues, setInitialValues] = useState<any>(null);

  useEffect(() => {
    if (typeof query.id === 'string') {
      const id = _.toNumber(query.id);
      getPayload(id)
        .then((res) => {
          let { content } = res;
          try {
            content = JSON.parse(content);
            setInitialValues(content);
          } catch (e) {
            console.error(e);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  if (loading) return null;

  return (
    <PageLayout title={t('title')} showBack backPath='/built-in-components'>
      {initialValues ? <Form type={3} initialValues={initialValues} /> : <div>{t('alertRulesBuiltin:detail_no_result')}</div>}
    </PageLayout>
  );
}
