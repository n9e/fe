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
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import _ from 'lodash';
import PageLayout from '@/components/pageLayout';
import { generateQueryNameByIndex } from '@/components/QueryName';
import Form from './Form';
import { defaultValues } from './Form/constants';

export default function Add() {
  const { t } = useTranslation('alertRules');
  const { bgid } = useParams<{ bgid: string }>();
  const location = useLocation();
  const query = queryString.parse(location.search);
  let initialValues: any = undefined;

  // 2024-09-03 支持从采集测试里快速创建告警规则，目前只支持 prometheus 数据源，会携带 promql 参数
  if (query.promql) {
    const promqls = _.isArray(query.promql) ? query.promql : [query.promql];
    initialValues = {
      ...defaultValues,
      group_id: Number(bgid),
      rule_config: {
        version: 'v2',
        queries: _.map(promqls, (promql, idx) => {
          return {
            query: promql,
            ref: generateQueryNameByIndex(idx),
          };
        }),
      },
    };
  }

  return (
    <PageLayout title={t('title')} showBack backPath='/alert-rules'>
      <Form initialValues={initialValues} />
    </PageLayout>
  );
}
