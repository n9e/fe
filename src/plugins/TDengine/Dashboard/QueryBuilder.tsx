import React from 'react';
import { Form, Row, Col, Input, Button, Tooltip } from 'antd';
import { DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import TimeRangePicker, { isMathString } from '@/components/TimeRangePicker';
import AdvancedSettings from '@/plugins/TDengine/components/AdvancedSettings';
import Collapse, { Panel } from '@/pages/dashboard/Editor/Components/Collapse';
import getFirstUnusedLetter from '@/pages/dashboard/Renderer/utils/getFirstUnusedLetter';
import { replaceExpressionVars } from '@/pages/dashboard/VariableConfig/constant';
import SqlTemplates from '../components/SqlTemplates';
import { MetaModal } from '../components/Meta';

const alphabet = 'ABCDEFGHIGKLMNOPQRSTUVWXYZ'.split('');

export default function TDengineQueryBuilder({ chartForm, variableConfig, dashboardId }) {
  const { t } = useTranslation('dashboard');

  return (
    <Form.List name='targets'>
      {(fields, { add, remove }, { errors }) => {
        return (
          <>
            <Collapse>
              {_.map(fields, (field, index) => {
                return (
                  <Panel
                    header={
                      <Form.Item noStyle shouldUpdate>
                        {({ getFieldValue }) => {
                          return getFieldValue(['targets', field.name, 'refId']) || alphabet[index];
                        }}
                      </Form.Item>
                    }
                    key={field.key}
                    extra={
                      <div>
                        {fields.length > 1 ? (
                          <DeleteOutlined
                            style={{ marginLeft: 10 }}
                            onClick={() => {
                              remove(field.name);
                            }}
                          />
                        ) : null}
                      </div>
                    }
                  >
                    <Form.Item noStyle {...field} name={[field.name, 'refId']}>
                      <div />
                    </Form.Item>
                    <Row gutter={10}>
                      <Col flex='auto'>
                        <Form.Item
                          label={
                            <span>
                              查询条件{' '}
                              <Tooltip
                                title={
                                  <span>
                                    TDengine 查询语法可参考
                                    <a target='_blank' href='https://docs.taosdata.com/taos-sql/select/'>
                                      官方文档
                                    </a>
                                  </span>
                                }
                              >
                                <InfoCircleOutlined />
                              </Tooltip>
                            </span>
                          }
                          {...field}
                          name={[field.name, 'query', 'query']}
                          validateTrigger={['onBlur']}
                          rules={[
                            {
                              required: true,
                              message: t('db_tdengine:query.query_msg'),
                            },
                          ]}
                          style={{ flex: 1 }}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col flex='92px'>
                        <div style={{ marginTop: 27 }}>
                          <SqlTemplates
                            onSelect={(sql) => {
                              const targets = _.cloneDeep(chartForm.getFieldValue('targets'));
                              _.set(targets, [field.name, 'query', 'query'], sql);
                              chartForm.setFieldsValue({
                                targets,
                              });
                            }}
                          />
                        </div>
                      </Col>
                      <Col flex='62px'>
                        <div style={{ marginTop: 27 }}>
                          <Form.Item shouldUpdate={(prevValues, curValues) => _.isEqual(prevValues.datasourceValue, curValues.datasourceValue)} noStyle>
                            {({ getFieldValue }) => {
                              let datasourceValue = getFieldValue('datasourceValue');
                              datasourceValue = variableConfig ? replaceExpressionVars(datasourceValue, variableConfig, variableConfig.length, dashboardId) : datasourceValue;
                              return (
                                <MetaModal
                                  datasourceValue={datasourceValue}
                                  onTreeNodeClick={(nodeData) => {
                                    const targets = _.cloneDeep(chartForm.getFieldValue('targets'));
                                    _.set(targets, [field.name, 'query', 'query'], `select * from ${nodeData.database}.${nodeData.table} where _ts >= $from and _ts < $to`);
                                    if (nodeData.levelType === 'field') {
                                      _.set(targets, [field.name, 'query', 'keys'], {
                                        ...(targets?.[field.name]?.query?.keys || {}),
                                        metricKey: [nodeData.field],
                                      });
                                    }
                                    chartForm.setFieldsValue({
                                      targets,
                                    });
                                  }}
                                />
                              );
                            }}
                          </Form.Item>
                        </div>
                      </Col>
                    </Row>
                    <Row gutter={10}>
                      <Col flex='auto'>
                        <Form.Item
                          label='Legend'
                          {...field}
                          name={[field.name, 'legend']}
                          tooltip={{
                            getPopupContainer: () => document.body,
                            title: t('dashboard:query.legendTip', {
                              interpolation: { skipOnVariables: true },
                            }),
                          }}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col flex='100px'>
                        <Form.Item
                          label={t('query.time')}
                          {...field}
                          name={[field.name, 'time']}
                          tooltip={{
                            getPopupContainer: () => document.body,
                            title: t('query.time_tip'),
                          }}
                          normalize={(val) => {
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
                    </Row>

                    <AdvancedSettings mode='graph' span={8} prefixField={field} prefixName={[field.name, 'query']} />
                  </Panel>
                );
              })}

              <Form.ErrorList errors={errors} />
            </Collapse>
            <Button
              style={{ width: '100%', marginTop: 10 }}
              onClick={() => {
                add({ expr: '', refId: getFirstUnusedLetter(_.map(chartForm.getFieldValue('targets'), 'refId')) });
              }}
            >
              + add query
            </Button>
          </>
        );
      }}
    </Form.List>
  );
}
