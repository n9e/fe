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
import { Form, Space, Button, message, Affix, Card, Alert } from 'antd';
import { useTranslation } from 'react-i18next';
import { useHistory, useParams, Link } from 'react-router-dom';
import _ from 'lodash';
import { CommonStateContext } from '@/App';
import { addStrategy, EditStrategy } from '@/services/warning';
import { scrollToFirstError } from '@/utils';
import AffixWrapper from '@/components/AffixWrapper';
import Base from './Base';
import Rule from './Rule';
import Effective from './Effective';
import Notify from './Notify';
import EventSettings from './EventSettings';
import { processFormValues, processInitialValues } from './utils';
import { defaultValues } from './constants';
import PipelineConfigs from './PipelineConfigs';

interface IProps {
  type?: number; // 空: 新增 1:编辑 2:克隆 3:查看
  initialValues?: any;
  editable?: boolean;
}

export const FormStateContext = createContext({
  disabled: false,
});

export default function index(props: IProps) {
  const { type, initialValues, editable = true } = props;
  const history = useHistory();
  const { bgid } = useParams<{ bgid: string }>();
  const { t } = useTranslation('alertRules');
  const [form] = Form.useForm();
  const { licenseRulesRemaining, datasourceCateOptions } = useContext(CommonStateContext);
  const disabled = type === 3;
  const containerRef = React.useRef(null);
  // TODO: 废弃的检测，beta.5 起已经不需要
  const handleCheck = async (values) => {
    if (values.cate === 'prometheus') {
      if (values.rule_config.checked && values.prod === 'anomaly') {
        message.warning('请先校验指标');
        return;
      }
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
    if (type === 1 || type === 2 || type === 3 || !_.isEmpty(initialValues)) {
      form.setFieldsValue(processInitialValues(initialValues));
    } else {
      const newValues = {
        ...defaultValues,
        group_id: Number(bgid),
      };
      // 如果有prometheus数据源，则默认选择prometheus
      if (
        _.find(datasourceCateOptions, {
          value: 'prometheus',
        })
      ) {
        newValues.prod = 'metric';
        newValues.cate = 'prometheus';
      } else {
        // 否则选择第一个数据源
        if (datasourceCateOptions.length) {
          newValues.prod = datasourceCateOptions[0].type[0];
          newValues.cate = datasourceCateOptions[0].value;
        } else {
          // 如果没有数据源，则默认选择host
          newValues.prod = 'host';
          newValues.cate = 'host';
        }
      }
      form.setFieldsValue(newValues);
    }
  }, [initialValues]);

  return (
    <FormStateContext.Provider
      value={{
        disabled,
      }}
    >
      <div style={{ overflow: 'hidden auto', padding: 0 }} ref={containerRef}>
        <Form form={form} layout='vertical' disabled={disabled} style={{ background: 'unset' }}>
          <div className='p2'>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {editable === false && (
                <Affix
                  target={() => {
                    return containerRef.current || window;
                  }}
                >
                  <Alert type='warning' message={t('expired')} />
                </Affix>
              )}
              <Form.Item name='disabled' hidden>
                <div />
              </Form.Item>
              <Base />
              <Rule form={form} />
              <EventSettings initialValues={initialValues} />
              <Effective />
              <PipelineConfigs />
              <Notify disabled={disabled} />
            </div>
            <AffixWrapper>
              <Card size='small' className='affix-bottom-shadow'>
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
                            scrollToFirstError();
                          });
                      }}
                      disabled={editable === false}
                    >
                      {t('common:btn.save')}
                    </Button>
                    <Link to='/alert-rules'>
                      <Button>{t('common:btn.cancel')}</Button>
                    </Link>
                  </Space>
                )}
              </Card>
            </AffixWrapper>
          </div>
        </Form>
      </div>
    </FormStateContext.Provider>
  );
}
