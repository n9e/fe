import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, Tooltip, AutoComplete, InputNumber, Select, Space } from 'antd';
import { PlusCircleOutlined, QuestionCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';
import { getIndices } from '@/pages/explorer/Elasticsearch/services';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { alphabet } from '@/utils/constant';
import Value from './Value';
import DateField from './DateField';
import GraphPreview from './GraphPreview';
import './style.less';

// @ts-ignore
import EnrichQueryValuesMaxLen from '@/plus/parcels/AlertRule/NotifyExtra/EnrichQueryValuesMaxLen';

interface IProps {
  disabled?: boolean;
}

export default function index(props: IProps) {
  const { t } = useTranslation('alertRules');
  const { disabled } = props;
  const [indexOptions, setIndexOptions] = useState<any[]>([]);
  const [indexSearch, setIndexSearch] = useState('');
  const names = ['extra_config', 'enrich_queries'];
  const datasourceValue = Form.useWatch('datasource_value');
  const namesValue = Form.useWatch(names) ?? [];

  useEffect(() => {
    if (datasourceValue !== undefined) {
      getIndices(datasourceValue).then((res) => {
        setIndexOptions(
          _.map(res, (item) => {
            return {
              value: item,
            };
          }),
        );
      });
    }
  }, [datasourceValue]);

  return (
    <>
      <Form.List name={names}>
        {(fields, { add, remove }) => (
          <div>
            <div style={{ marginBottom: 8 }}>
              <Space>
                <span>{t('db_aliyunSLS:enrich_queries.title')}</span>
                <PlusCircleOutlined
                  disabled={disabled}
                  onClick={() =>
                    add({
                      interval_unit: 'min',
                      interval: 1,
                      date_field: '@timestamp',
                      value: {
                        func: 'rawData',
                      },
                    })
                  }
                />
              </Space>
            </div>
            {fields.map((field, index) => {
              return (
                <div key={field.key} className='n9e-fill-color-3' style={{ padding: 10, marginBottom: 10, position: 'relative' }}>
                  <Row gutter={8}>
                    <Col flex='32px'>
                      <Form.Item name={[field.name, 'ref']} initialValue={alphabet[index]}>
                        <Input readOnly style={{ width: '32px' }} />
                      </Form.Item>
                    </Col>
                    <Col flex='auto'>
                      <Row gutter={8}>
                        <Col span={7}>
                          <InputGroupWithFormItem
                            label={
                              <span>
                                {t('datasource:es.index')}{' '}
                                <Tooltip title={<Trans ns='datasource' i18nKey='datasource:es.index_tip' components={{ 1: <br /> }} />}>
                                  <QuestionCircleOutlined />
                                </Tooltip>
                              </span>
                            }
                          >
                            <Form.Item
                              {...field}
                              name={[field.name, 'index']}
                              rules={[
                                {
                                  required: true,
                                  message: t('datasource:es.index_msg'),
                                },
                              ]}
                            >
                              <AutoComplete
                                style={{ width: '100%' }}
                                dropdownMatchSelectWidth={false}
                                options={_.filter(indexOptions, (item) => {
                                  if (indexSearch) {
                                    return item.value.includes(indexSearch);
                                  }
                                  return true;
                                })}
                                onSearch={(val) => {
                                  setIndexSearch(val);
                                }}
                                disabled={disabled}
                              />
                            </Form.Item>
                          </InputGroupWithFormItem>
                        </Col>
                        <Col span={7}>
                          <InputGroupWithFormItem
                            label={
                              <span>
                                {t('datasource:es.filter')}{' '}
                                <a href='https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax ' target='_blank'>
                                  <QuestionCircleOutlined />
                                </a>
                              </span>
                            }
                            labelWidth={90}
                          >
                            <Form.Item {...field} name={[field.name, 'filter']}>
                              <Input disabled={disabled} />
                            </Form.Item>
                          </InputGroupWithFormItem>
                        </Col>
                        <Col span={5}>
                          <Form.Item shouldUpdate noStyle>
                            {({ getFieldValue }) => {
                              const index = getFieldValue([...names, field.name, 'index']);
                              return <DateField disabled={disabled} datasourceValue={datasourceValue} index={index} prefixField={field} prefixNames={names} />;
                            }}
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Input.Group>
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
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue }) => {
                      const index = getFieldValue([...names, field.name, 'index']);
                      return (
                        <>
                          <Value datasourceValue={datasourceValue} index={index} prefixField={field} prefixNames={names} disabled={disabled} />
                        </>
                      );
                    }}
                  </Form.Item>
                  <CloseCircleOutlined
                    style={{ position: 'absolute', right: -4, top: -4 }}
                    onClick={() => {
                      remove(field.name);
                    }}
                    disabled={disabled}
                  />
                </div>
              );
            })}
            {fields.length > 0 && <GraphPreview datasourceValue={datasourceValue} />}
          </div>
        )}
      </Form.List>
      <div className='mt1'>
        <EnrichQueryValuesMaxLen hidden={namesValue.length === 0} />
      </div>
    </>
  );
}
