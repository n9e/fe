import React, { useState, useEffect, useContext } from 'react';
import { Form, Input, Row, Col, Tooltip, AutoComplete, InputNumber, Select, Card, Space } from 'antd';
import { PlusCircleOutlined, QuestionCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';
import { getIndices } from '@/pages/explorer/Elasticsearch/services';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import GroupBy from '@/pages/dashboard/Editor/QueryEditor/Elasticsearch/GroupBy';
import QueryName, { generateQueryName } from '@/components/QueryName';
import DocumentDrawer from '@/components/DocumentDrawer';
import { CommonStateContext } from '@/App';
import GraphPreview from '../GraphPreview';
import Value from './Value';
import DateField from './DateField';
import AdvancedSettings from './AdvancedSettings';

interface IProps {
  datasourceValue: number;
  form: any;
  disabled?: boolean;
}

export default function index(props: IProps) {
  const { t, i18n } = useTranslation('alertRules');
  const { darkMode } = useContext(CommonStateContext);
  const { datasourceValue, form, disabled } = props;
  const [indexOptions, setIndexOptions] = useState<any[]>([]);
  const [indexSearch, setIndexSearch] = useState('');
  const names = ['rule_config', 'queries'];
  const queries = Form.useWatch(names);

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
    <Form.List name={names}>
      {(fields, { add, remove }) => (
        <Card
          title={
            <Space>
              <span>{t('datasource:es.alert.query.title')}</span>
              <PlusCircleOutlined
                disabled={disabled}
                onClick={() =>
                  add({
                    interval_unit: 'min',
                    interval: 5,
                    date_field: '@timestamp',
                    value: {
                      func: 'count',
                    },
                  })
                }
              />
            </Space>
          }
          size='small'
        >
          {fields.map((field, index) => {
            return (
              <div key={field.key} className='n9e-fill-color-3' style={{ padding: 10, marginBottom: 10, position: 'relative' }}>
                <Row gutter={8}>
                  <Col flex='32px'>
                    <Form.Item {...field} name={[field.name, 'ref']} initialValue={generateQueryName(_.map(queries, 'ref'))}>
                      <QueryName existingNames={_.map(queries, 'ref')} />
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
                              <Tooltip title={t('common:page_help')}>
                                <QuestionCircleOutlined
                                  onClick={() => {
                                    DocumentDrawer({
                                      language: i18n.language,
                                      darkMode,
                                      title: t('common:page_help'),
                                      type: 'iframe',
                                      documentPath:
                                        'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/alarm-management/alert-rules/rule-configuration/business/es-alarm-rules/',
                                    });
                                  }}
                                />
                              </Tooltip>
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
                            <InputNumber disabled={disabled} style={{ width: '100%' }} min={0} />
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
                        <div style={{ marginTop: 8 }}>
                          <GroupBy datasourceValue={datasourceValue} index={index} parentNames={names} prefixField={field} prefixFieldNames={[field.name]} disabled={disabled} />
                        </div>
                      </>
                    );
                  }}
                </Form.Item>
                <AdvancedSettings field={field} />
                {fields.length > 1 && (
                  <CloseCircleOutlined
                    style={{ position: 'absolute', right: -4, top: -4 }}
                    onClick={() => {
                      remove(field.name);
                    }}
                    disabled={disabled}
                  />
                )}
              </div>
            );
          })}

          <GraphPreview form={form} datasourceValue={datasourceValue} />
        </Card>
      )}
    </Form.List>
  );
}
