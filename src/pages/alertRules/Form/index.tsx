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
import React, { useContext, useEffect, createContext } from 'react';
import { Form, Space, Button, notification, message, Tooltip } from 'antd';
import { Trans, useTranslation } from 'react-i18next';
import { useHistory, useParams, Link } from 'react-router-dom';
import _ from 'lodash';
import { CommonStateContext } from '@/App';
import { addStrategy, EditStrategy, prometheusQuery, validateRule } from '@/services/warning';
import Base from './Base';
import Rule from './Rule';
import Effective from './Effective';
import Notify from './Notify';
import { getFirstDatasourceId, processFormValues, processInitialValues } from './utils';
import { defaultValues } from './constants';

interface IProps {
  type?: number; // 空: 新增 1:编辑 2:克隆 3:查看
  initialValues?: any;
}

export const FormStateContext = createContext({
  disabled: false,
});

export default function index(props: IProps) {
  const { type, initialValues } = props;
  const history = useHistory();
  const { bgid } = useParams<{ bgid: string }>();
  const { t } = useTranslation('alertRules');
  const [form] = Form.useForm();
  const { groupedDatasourceList, licenseRulesRemaining } = useContext(CommonStateContext);
  const disabled = type === 3;
  const handleCheck = async (values) => {
    if (values.cate === 'prometheus') {
      if (values.rule_config.checked && values.prod === 'anomaly') {
        message.warning('请先校验指标');
        return;
      }
      // TODO: 多个 promql 怎么校验？
      // const datasourceId = getFirstDatasourceId(values.datasource_ids, groupedDatasourceList[values.cate]);
      // const res = await prometheusQuery({ query: values.prom_ql }, datasourceId);
      // if (res.error) {
      //   notification.error({
      //     message: res.error,
      //   });
      //   return false;
      // }
    } else if (type !== 1) {
      if (licenseRulesRemaining === 0 && values.prod === 'anomaly') {
        message.error('可添加的智能告警规则数量已达上限，请联系客服');
      }
    }
  };
  const handleMessage = (res) => {
    if (type === 1) {
      if (res.err) {
        message.error(res.error);
      } else {
        message.success(t('common:success.modify'));
        history.push('/alert-rules');
      }
    } else {
      const { dat } = res;
      let errorNum = 0;
      const msg = Object.keys(dat).map((key) => {
        dat[key] && errorNum++;
        return dat[key];
      });

      if (!errorNum) {
        message.success(`${type === 2 ? t('common:success.clone') : t('common:success.add')}`);
        history.push('/alert-rules');
      } else {
        message.error(t(msg));
      }
    }
  };

  useEffect(() => {
    if (type === 1 || type === 2 || type === 3) {
      form.setFieldsValue(processInitialValues(initialValues));
    } else {
      form.setFieldsValue(defaultValues);
    }
  }, [initialValues]);

  return (
    <FormStateContext.Provider
      value={{
        disabled,
      }}
    >
      <Form form={form} layout='vertical' disabled={disabled}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 10px', marginBottom: 24 }}>
          <Form.Item name='disabled' hidden>
            <div />
          </Form.Item>
          <Base />
          <Rule form={form} />
          <Effective />
          <Notify disabled={disabled} />
          {!disabled && (
            <Space>
              <Button
                type='primary'
                onClick={() => {
                  form
                    .validateFields()
                    .then(async (values) => {
                      handleCheck(values);
                      const data = processFormValues(values) as any;
                      if (type === 1) {
                        const res = await EditStrategy(data, initialValues.group_id, initialValues.id);
                        handleMessage(res);
                      } else {
                        const curBusiId = initialValues?.group_id || Number(bgid);
                        const res = await addStrategy([data], curBusiId);
                        handleMessage(res);
                      }
                    })
                    .catch((err) => {
                      console.error(err);
                    });
                }}
              >
                {t('common:btn.save')}
              </Button>
              {/* <Tooltip
                title={
                  <Trans
                    ns='alertRules'
                    i18nKey='testTip'
                    components={{
                      br: <br />,
                    }}
                  />
                }
              >
                <Button
                  onClick={() => {
                    form
                      .validateFields()
                      .then(async (values) => {
                        const data = processFormValues(values) as any;
                        validateRule(data);
                      })
                      .catch((err) => {
                        console.error(err);
                      });
                  }}
                >
                  {t('common:btn.test')}
                </Button>
              </Tooltip> */}
              <Link to='/alert-rules'>
                <Button>{t('common:btn.cancel')}</Button>
              </Link>
            </Space>
          )}
        </div>
      </Form>
    </FormStateContext.Provider>
  );
}
