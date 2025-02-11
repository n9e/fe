import React from 'react';
import { Form, Space, Input, Row, Col, Card, InputNumber, Select, Tooltip } from 'antd';
import { PlusCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import AdvancedSettings from '@/plugins/TDengine/components/AdvancedSettings';
import QueryName, { generateQueryName } from '@/components/QueryName';
import GraphPreview from './GraphPreview';
import SqlTemplates from '../../components/SqlTemplates';
import { MetaModal } from '../../components/Meta';
import './style.less';

interface IProps {
  form: any;
  prefixField?: any;
  fullPrefixName?: string[]; // 完整的前置字段名，用于 getFieldValue 获取指定字段的值
  prefixName?: string[]; // 列表字段名
  disabled?: boolean;
  datasourceValue: number | number[];
}

export default function index({ form, prefixField = {}, fullPrefixName = [], prefixName = [], disabled, datasourceValue }: IProps) {
  const { t } = useTranslation('db_tdengine');
  const datasourceID = _.isArray(datasourceValue) ? datasourceValue[0] : datasourceValue;
  const queries = Form.useWatch(['rule_config', 'queries']);

  return (
    <>
      <Form.List
        {...prefixField}
        name={[...prefixName, 'queries']}
        initialValue={[
          {
            ref: 'A',
          },
        ]}
      >
        {(fields, { add, remove }) => (
          <Card
            title={
              <Space>
                {t('query.title')}
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
            {fields.map((field, index) => {
              return (
                <div key={field.key} className='n9e-fill-color-3' style={{ padding: 16, marginBottom: 16, position: 'relative' }}>
                  <Row gutter={8}>
                    <Col flex='32px'>
                      <Form.Item {...field} name={[field.name, 'ref']} initialValue={generateQueryName(_.map(queries, 'ref'))}>
                        <QueryName existingNames={_.map(queries, 'ref')} />
                      </Form.Item>
                    </Col>
                    <Col flex='auto'>
                      <div className='tdengine-discover-query'>
                        <InputGroupWithFormItem
                          label={
                            <Space>
                              {t('query.query')}
                              <Tooltip
                                title={
                                  <span>
                                    {t('query.query_tip1')}
                                    <a className='pl1' target='_blank' href='https://docs.taosdata.com/basic/query/'>
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
                          <Form.Item {...field} name={[field.name, 'query']}>
                            <Input />
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
                          onSelect={(sql) => {
                            const queries = _.cloneDeep(form.getFieldValue([...prefixName, 'queries']));
                            _.set(queries, [field.name, 'query'], sql);
                            form.setFieldsValue({
                              rule_config: {
                                ...form.getFieldValue('rule_config'),
                                queries,
                              },
                            });
                          }}
                        />
                        <MetaModal
                          datasourceValue={datasourceID}
                          onTreeNodeClick={(nodeData) => {
                            const queries = _.cloneDeep(form.getFieldValue([...prefixName, 'queries']));
                            _.set(queries, [field.name, 'query'], `select * from ${nodeData.database}.${nodeData.table} where _ts >= $from and _ts < $to`);
                            if (nodeData.levelType === 'field') {
                              _.set(queries, [field.name, 'keys'], {
                                ...(queries?.[field.name]?.keys || {}),
                                metricKey: [nodeData.field],
                              });
                            }
                            form.setFieldsValue({
                              rule_config: {
                                ...form.getFieldValue('rule_config'),
                                queries,
                              },
                            });
                          }}
                        />
                      </div>
                    </Col>
                  </Row>
                  <AdvancedSettings mode='graph' prefixField={field} prefixName={[field.name]} disabled={disabled} showUnit expanded />
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
    </>
  );
}
