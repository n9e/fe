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
import Form from './FormNG';
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
        // 克隆时名称追加后缀，避免保存后列表出现两条同名规则难以区分
        if (mode === 'clone' && data.name) {
          data.name = `${data.name}${t('clone_suffix')}`;
        }
        setValues(data);
      });
    }
  }, [alertRuleId]);

  // 「保存」（留在当前页）成功后刷新 update_at 基准，避免轮询把自己的这次保存误判为他人修改而锁定表单。
  // PUT 接口只返回 { err }，拿不到本次写入的 update_at，只能补一次 GET；期间必须屏蔽轮询，
  // 否则轮询会拿保存后的 update_at 去和保存前的基准比对，误报「已被他人修改」。
  const baselineRefreshingRef = useRef(false);

  const handleSaveStay = () => {
    baselineRefreshingRef.current = true;
    getAlertRulePure(alertRuleId)
      .then((res) => {
        // 拿不到 update_at 时一并置空：宁可本次会话不做冲突检测，也不能留着过期基准把表单永久锁死
        updateAtRef.current = res?.update_at;
      })
      .catch((error) => {
        console.error(error);
        updateAtRef.current = undefined;
      })
      .finally(() => {
        baselineRefreshingRef.current = false;
      });
  };

  useInterval(() => {
    if (baselineRefreshingRef.current) return;
    if (import.meta.env.PROD && typeof alertRuleId === 'number' && mode === undefined) {
      getAlertRulePure(alertRuleId).then((res) => {
        // 请求发出后若开始刷新基准，说明这中间发生了一次保存，本次响应已过期，直接丢弃
        if (baselineRefreshingRef.current) return;
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
      <div className='n9e h-full overflow-hidden p-0'>
        {!_.isEmpty(values) && <Form type={mode === 'clone' ? 2 : 1} initialValues={values} editable={editable} onSaveStay={handleSaveStay} />}
      </div>
    </PageLayout>
  );
}
