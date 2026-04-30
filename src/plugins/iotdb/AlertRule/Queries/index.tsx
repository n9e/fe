import React from 'react';
import { Form, Space, Input, Row, Col, Card, InputNumber, Select, Tooltip } from 'antd';
import { PlusCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { DatasourceCateEnum, IS_PLUS } from '@/utils/constant';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import AdvancedSettings from '../../components/AdvancedSettings';
import QueryName, { generateQueryName } from '@/components/QueryName';
import SqlTemplates from '../../components/SqlTemplates';
import { MetaModal } from '../../components/Meta';
import GraphPreview from './GraphPreview';

import './style.less';

interface IProps {
  form: any;
  prefixField?: any;
  fullPrefixName?: string[];
  prefixName?: string[];
  disabled?: boolean;
  datasourceValue: number | number[];
}

export default function IotDBAlertRuleQueries({ form, prefixField = {}, fullPrefixName = [], prefixName = [], disabled, datasourceValue }: IProps) {
  const { t } = useTranslation('db_iotdb');
  const datasourceID = _.isArray(datasourceValue) ? datasourceValue[0] : datasourceValue;
  const queries = Form.useWatch(['rule_config', 'queries']);

  return (
    <Form.List
      {...prefixField}
      name={[...prefixName, 'queries']}
      initialValue={[
        {
          ref: 'A',
          interval: 1,
          interval_unit: 'min',
        },
      ]}
    >
      {(fields, { add, remove }) => (
        <Card
          title={
            <Space>
              {t('datasource:query.title')}
              <PlusCircleOutlined
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  add({
                    interval: 1,
                    interval_unit: 'min',
                  });
                }}
              />
            </Space>
          }
          size='small'
        >
          {fields.map((field) => {
            return (
              <div key={field.key} className='iotdb-alert-rule-query-card bg-fc-200'>
                <Row gutter={8}>
                  <Col flex='32px'>
                    <Form.Item {...field} name={[field.name, 'ref']} initialValue={generateQueryName(_.map(queries, 'ref'))}>
                      <QueryName existingNames={_.map(queries, 'ref')} />
                    </Form.Item>
                  </Col>
                  <Col flex='auto'>
                    <div className='iotdb-alert-rule-query'>
                      <InputGroupWithFormItem
                        label={
                          <Space>
                            {t('query.query')}
                            <Tooltip
                              title={
                                <span>
                                  IoTDB 查询语法可参考
                                  <a className='pl-2' target='_blank' href='https://iotdb.apache.org/UserGuide/latest-Table/API/SQL-Manual.html'>
                                    {t('query.query_tip2')}
                                  </a>
                                </span>
                              }
                            >
                              <InfoCircleOutlined />
                            </Tooltip>
                          </Space>
                        }
                      >
                        <Form.Item {...field} name={[field.name, 'query']} rules={[{ required: true, message: t('query.query_msg') }]}>
                          <Input disabled={disabled} />
                        </Form.Item>
                      </InputGroupWithFormItem>
                      <Input.Group style={{ height: 32, width: 380 }}>
                        <span className='ant-input-group-addon'>{t('datasource:es.interval')}</span>
                        <Form.Item {...field} name={[field.name, 'interval']} noStyle>
                          <InputNumber disabled={disabled} style={{ width: '100%' }} />
                        </Form.Item>
                        <span className='ant-input-group-addon'>
                          <Form.Item {...field} name={[field.name, 'interval_unit']} noStyle initialValue='min'>
                            <Select disabled={disabled}>
                              <Select.Option value='second'>{t('common:time.second')}</Select.Option>
                              <Select.Option value='min'>{t('common:time.minute')}</Select.Option>
                              <Select.Option value='hour'>{t('common:time.hour')}</Select.Option>
                            </Select>
                          </Form.Item>
                        </span>
                      </Input.Group>
                      <SqlTemplates
                        cate={DatasourceCateEnum.iotdb}
                        onSelect={(sql) => {
                          const nextQueries = _.cloneDeep(form.getFieldValue([...prefixName, 'queries']));
                          _.set(nextQueries, [field.name, 'query'], sql);
                          form.setFieldsValue({
                            rule_config: {
                              ...form.getFieldValue('rule_config'),
                              queries: nextQueries,
                            },
                          });
                        }}
                      />
                      <MetaModal
                        datasourceCate={DatasourceCateEnum.iotdb}
                        datasourceValue={datasourceID}
                        onTreeNodeClick={(nodeData) => {
                          const nextQueries = _.cloneDeep(form.getFieldValue([...prefixName, 'queries']));
                          if (nodeData.levelType === 'field') {
                            _.set(nextQueries, [field.name, 'query'], `select time, ${nodeData.field} from ${nodeData.table}`);
                            _.set(nextQueries, [field.name, 'keys'], {
                              ...(nextQueries?.[field.name]?.keys || {}),
                              metricKey: [nodeData.field],
                              timeKey: 'time',
                            });
                          } else {
                            _.set(nextQueries, [field.name, 'query'], `select * from ${nodeData.table}`);
                          }
                          form.setFieldsValue({
                            rule_config: {
                              ...form.getFieldValue('rule_config'),
                              queries: nextQueries,
                            },
                          });
                        }}
                      />
                    </div>
                  </Col>
                </Row>
                <AdvancedSettings mode='graph' prefixField={field} prefixName={[field.name]} disabled={disabled} showUnit={IS_PLUS} expanded datasourceCate={DatasourceCateEnum.iotdb} />
                {fields.length > 1 && (
                  <CloseCircleOutlined
                    style={{ position: 'absolute', right: -4, top: -4 }}
                    onClick={() => {
                      remove(field.name);
                    }}
                  />
                )}
                <Form.Item shouldUpdate noStyle>
                  {({ getFieldValue }) => {
                    const cate = getFieldValue('cate');
                    const query = getFieldValue([...fullPrefixName, ...prefixName, 'queries', field.name]);

                    return <GraphPreview cate={cate} datasourceValue={datasourceID} query={query} />;
                  }}
                </Form.Item>
              </div>
            );
          })}
        </Card>
      )}
    </Form.List>
  );
}
