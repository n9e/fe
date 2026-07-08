import React from 'react';
import { Form, Row, Col, Input, Button, Tooltip } from 'antd';
import { DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { generateQueryNameByIndex } from '@/components/QueryName/utils';
import AdvancedSettings from '@/plugins/TDengine/components/AdvancedSettings';
import Collapse, { Panel } from '@/pages/dashboard/Editor/Components/Collapse';
import getFirstUnusedLetter from '@/pages/dashboard/Renderer/utils/getFirstUnusedLetter';
import SqlTemplates from '../components/SqlTemplates';
import { MetaModal } from '../components/Meta';

export default function TDengineQueryBuilder({ datasourceValue }) {
  const { t } = useTranslation('dashboard');
  const chartForm = Form.useFormInstance();

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
                          return getFieldValue(['targets', field.name, 'refId']) || generateQueryNameByIndex(index);
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
                              {t('db_tdengine:query.query')}{' '}
                              <Tooltip
                                title={
                                  <span>
                                    {t('db_tdengine:query.query_tip1')}
                                    <a target='_blank' href='https://docs.taosdata.com/basic/query/'>
                                      {t('db_tdengine:query.query_tip2')}
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
