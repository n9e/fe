import React from 'react';
import { Form, Row, Col, Input, Switch, InputNumber, Space, Tag, Tooltip } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import TimeRangePicker, { isMathString } from '@/components/TimeRangePicker';
import Resolution from '@/components/Resolution';
import { PromQLInputWithBuilder } from '@/components/PromQLInput';
import { getRealStep } from '@/pages/dashboard/Renderer/datasource/prometheus';
import HideButton from '@/pages/dashboard/Components/HideButton';
import { IS_PLUS } from '@/utils/constant';
import Collapse, { Panel } from '../Components/Collapse';
import ExpressionPanel from '../Components/ExpressionPanel';
import AddQueryButtons from '../Components/AddQueryButtons';
import { replaceExpressionVars } from '../../VariableConfig/constant';

const alphabet = 'ABCDEFGHIGKLMNOPQRSTUVWXYZ'.split('');

export default function Prometheus({ chartForm, variableConfig, dashboardId, time }) {
  const { t } = useTranslation('dashboard');
  const varNams = _.map(variableConfig, (item) => {
    return `$${item.name}`;
  });
  const targets = Form.useWatch('targets');

  return (
    <Form.List name='targets'>
      {(fields, { add, remove }, { errors }) => {
        return (
          <>
            <Collapse>
              {_.map(fields, (field, index) => {
                const { __mode__ } = targets?.[field.name] || {};
                if (__mode__ === '__expr__') {
                  return <ExpressionPanel key={field.key} fields={fields} remove={remove} field={field} />;
                }
                return (
                  <Panel
                    header={
                      <Form.Item noStyle shouldUpdate>
                        {({ getFieldValue }) => {
                          const target = getFieldValue(['targets', field.name]);
                          const step = getRealStep(time, target);
                          const name = target?.refId || alphabet[index];
                          return (
                            <Space>
                              {name}
                              {step ? (
                                <Tooltip placement='right' title={t('query.prometheus.step.tag_tip')}>
                                  <Tag color='purple'>{`step=${step}s`}</Tag>
                                </Tooltip>
                              ) : null}
                            </Space>
                          );
                        }}
                      </Form.Item>
                    }
                    key={field.key}
                    extra={
                      <Space>
                        {IS_PLUS && (
                          <Form.Item noStyle {...field} name={[field.name, 'hide']}>
                            <HideButton />
                          </Form.Item>
                        )}
                        {fields.length > 1 ? (
                          <DeleteOutlined
                            onClick={() => {
                              remove(field.name);
                            }}
                          />
                        ) : null}
                      </Space>
                    }
                  >
                    <Form.Item noStyle {...field} name={[field.name, 'refId']}>
                      <div />
                    </Form.Item>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Form.Item shouldUpdate={(prevValues, curValues) => _.isEqual(prevValues.datasourceValue, curValues.datasourceValue)} noStyle>
                        {({ getFieldValue }) => {
                          let datasourceValue = getFieldValue('datasourceValue');
                          datasourceValue = variableConfig ? replaceExpressionVars(datasourceValue, variableConfig, variableConfig.length, dashboardId) : datasourceValue;
                          return (
                            <Form.Item
                              label='PromQL'
                              {...field}
                              name={[field.name, 'expr']}
                              validateTrigger={['onBlur']}
                              rules={[
                                {
                                  required: true,
                                  message: '',
                                },
                              ]}
                              style={{ flex: 1 }}
                            >
                              <PromQLInputWithBuilder
                                validateTrigger={['onBlur']}
                                datasourceValue={datasourceValue}
                                extraLabelValues={varNams}
                                rangeVectorCompletion
                                showBuiltinMetrics
                                showBuilder={false}
                              />
                            </Form.Item>
                          );
                        }}
                      </Form.Item>
                    </div>
                    <Row gutter={10}>
                      <Col flex='auto'>
                        <Form.Item
                          label='Legend'
                          {...field}
                          name={[field.name, 'legend']}
                          tooltip={{
                            getPopupContainer: () => document.body,
                            title: t('query.legendTip', {
                              interpolation: { skipOnVariables: true },
                            }),
                          }}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col flex='116px'>
                        <Form.Item
                          label={t('query.time')}
                          {...field}
                          name={[field.name, 'time']}
                          tooltip={{
                            getPopupContainer: () => document.body,
                            title: t('query.time_tip'),
                          }}
                          normalize={(val) => {
                            if (val === undefined || val === null || val === '') return undefined;
                            return {
                              start: isMathString(val.start) ? val.start : moment(val.start).format('YYYY-MM-DD HH:mm:ss'),
                              end: isMathString(val.end) ? val.end : moment(val.end).format('YYYY-MM-DD HH:mm:ss'),
                            };
                          }}
                        >
                          <TimeRangePicker
                            dateFormat='YYYY-MM-DD HH:mm:ss'
                            allowClear
                            onClear={() => {
                              const targets = chartForm.getFieldValue('targets');
                              const targetsClone = _.cloneDeep(targets);
                              _.set(targetsClone, [field.name, 'time'], undefined);
                              chartForm.setFieldsValue({
                                targets: targetsClone,
                              });
                            }}
                          />
                        </Form.Item>
                      </Col>
                      <Col flex='120px'>
                        <Form.Item label='Max data points' tooltip={t('query.prometheus.maxDataPoints.tip')} {...field} name={[field.name, 'maxDataPoints']} initialValue={240}>
                          <InputNumber style={{ width: '100%' }} placeholder='240' min={1} />
                        </Form.Item>
                      </Col>
                      <Col flex='72px'>
                        <Form.Item label='Min step' tooltip={t('query.prometheus.minStep.tip')} {...field} name={[field.name, 'step']}>
                          <Resolution />
                        </Form.Item>
                      </Col>
                      <Col flex='72px'>
                        <Form.Item label='Instant' {...field} name={[field.name, 'instant']} valuePropName='checked'>
                          <Switch />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Panel>
                );
              })}

              <Form.ErrorList errors={errors} />
            </Collapse>
            <AddQueryButtons
              add={add}
              addQuery={(newRefId) => {
                add({ expr: '', __mode__: '__query__', refId: newRefId });
              }}
            />
          </>
        );
      }}
    </Form.List>
  );
}
