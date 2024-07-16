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
import React, { useEffect, useState, useRef } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { useInterval } from 'ahooks';
import PageLayout from '@/components/pageLayout';
import { getWarningStrategy } from '@/services/warning';
import Form from './Form';
import { getAlertRulePure } from './services';

export default function Edit() {
  const { t } = useTranslation('alertRules');
  const { id } = useParams<{ id: string }>();
  const alertRuleId = Number(id);
  const [values, setValues] = useState<any>({});
  const { search } = useLocation();
  const { mode } = queryString.parse(search);
  const [editable, setEditable] = useState(true);
  let updateAtRef = useRef<number>();

  useEffect(() => {
    if (alertRuleId) {
      getWarningStrategy(alertRuleId).then((res) => {
        const data = res.dat || {};
        updateAtRef.current = data.update_at;
        // 兼容 <= v6.2.x 版本 loki prod
        if (data.prod === 'loki') {
          data.prod = 'logging';
        }
        setValues(data);
      });
    }
  }, [alertRuleId]);

  useInterval(() => {
    if (typeof alertRuleId === 'number') {
      getAlertRulePure(alertRuleId).then((res) => {
        if (updateAtRef.current && res.update_at > updateAtRef.current) {
          if (editable) setEditable(false);
        } else {
          setEditable(true);
        }
      });
    }
  }, 2000);

  return (
    <PageLayout title={t('title')} showBack backPath='/alert-rules'>
      {!_.isEmpty(values) && <Form type={mode === 'clone' ? 2 : 1} initialValues={values} editable={editable} />}
    </PageLayout>
  );
}
