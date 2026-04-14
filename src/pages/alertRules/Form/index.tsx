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
import AiChat, { IAiChatMessage, IAiChatMessageResponse } from '@/components/AiChatNG';
import PromQLCard from '@/components/AiChatNG/customContentRenderer/PromQLCard';
import { AiChatProvider, useAiChatContext } from '@/components/AiChatNG/context';

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

function AlertRulesAiChatSidebar({ form }: { form: any }) {
  const { visible, datasourceCate, datasourceValue, callbackParams, closeAiChat, setDatasourceCate, setDatasourceValue } = useAiChatContext();
  const cate = Form.useWatch('cate', form);
  const currentDatasourceValue = Form.useWatch('datasource_value', form);
  const ruleConfigVersion = Form.useWatch(['rule_config', 'version'], form);

  useEffect(() => {
    setDatasourceCate(cate);
  }, [cate, setDatasourceCate]);

  useEffect(() => {
    setDatasourceValue(currentDatasourceValue);
  }, [currentDatasourceValue, setDatasourceValue]);

  useEffect(() => {
    if (visible && cate !== 'prometheus') {
      closeAiChat();
    }
  }, [visible, cate, closeAiChat]);

  if (!visible) {
    return null;
  }

  return (
    <div className='ml-4 w-[420px] flex-shrink-0 bg-fc-100 fc-border h-full rounded-lg p-4'>
      <AiChat
        key={JSON.stringify(callbackParams ?? {})}
        showClose
        onClose={closeAiChat}
        queryPageFrom={{
          page: 'alert',
        }}
        queryAction={{
          key: 'query_generator',
          param: {
            datasource_type: datasourceCate,
            datasource_id: datasourceValue,
          },
        }}
        promptList={['帮我生成一条 CPU 使用率查询', '解释当前查询语句', '给我一个 Prometheus 排障建议']}
        customContentRenderer={({ response, message }: { response: IAiChatMessageResponse; message: IAiChatMessage }) => {
          if (response.content_type === 'query') {
            return (
              <PromQLCard
                response={response}
                message={message}
                onExecuteQuery={(promql) => {
                  const ruleConfig = form.getFieldValue('rule_config') || {};
                  const queries = [...(ruleConfig.queries || [])];

                  if (!queries.length) {
                    return;
                  }

                  const queriesIndex = Number(callbackParams?.queriesIndex ?? 0);
                  const nextIndex = Math.min(queriesIndex, queries.length - 1);
                  const queryFieldName = ruleConfigVersion === 'v2' ? 'query' : 'prom_ql';

                  queries[nextIndex] = {
                    ...queries[nextIndex],
                    [queryFieldName]: promql,
                  };

                  form.setFieldsValue({
                    rule_config: {
                      ...ruleConfig,
                      queries,
                    },
                  });
                }}
              />
            );
          }
          return null;
        }}
      />
    </div>
  );
}

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
    <AiChatProvider>
      <FormStateContext.Provider
        value={{
          disabled,
        }}
      >
        <div className='flex h-full'>
          <div className='flex-1 min-w-0 h-full best-looking-scroll' ref={containerRef}>
            <Form form={form} layout='vertical' disabled={disabled}>
              <div className='flex flex-col gap-4'>
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
            </Form>
          </div>
          <AlertRulesAiChatSidebar form={form} />
        </div>
      </FormStateContext.Provider>
    </AiChatProvider>
  );
}
