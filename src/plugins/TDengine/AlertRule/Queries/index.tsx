import React, { useContext } from 'react';
import { Form, Space, Row, Col, InputNumber, Select, Button, Tooltip } from 'antd';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { WandSparkles } from 'lucide-react';
import CardContainer, { CardContainerHeader } from '@/pages/alertRules/FormNG/components/CardContainer';
import FormItemLabel from '@/pages/alertRules/FormNG/components/FormItemLabel';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { IS_PLUS } from '@/utils/constant';
import { CommonStateContext } from '@/App';
import { SqlMonacoEditor } from '@fc-components/monaco-editor';
import DocumentDrawer from '@/components/DocumentDrawer';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import AdvancedSettings from '@/plugins/TDengine/components/AdvancedSettings';
import QueryName, { generateQueryName } from '@/components/QueryName';

import SqlTemplates from '../../components/SqlTemplates';
import { MetaModal } from '../../components/Meta';
import GraphPreview from './GraphPreview';

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
  const { t, i18n } = useTranslation('db_tdengine');
  const { darkMode } = useContext(CommonStateContext);
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
          <div>
            <FormItemLabel>{t('datasource:query.title')}</FormItemLabel>
            {fields.map((field, index) => {
              return (
                <CardContainer key={field.key} onClose={fields.length > 1 ? () => remove(field.name) : undefined}>
                  <CardContainerHeader>
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
                                <Tooltip title={t('common:click_to_view_doc')}>
                                  <QuestionCircleOutlined
                                    onClick={() => {
                                      DocumentDrawer({
                                        language: i18n.language,
                                        darkMode,
                                        title: t('common:page_help'),
                                        type: 'iframe',
                                        documentPath:
                                          'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-rules/query-data/tdengine/',
                                      });
                                    }}
                                  />
                                </Tooltip>
                              </Space>
                            }
                          >
                            <Form.Item
                              {...field}
                              name={[field.name, 'query']}
                              validateTrigger={['onBlur']}
                              trigger='onChange'
                              rules={[{ required: true, message: t('query.query_msg') }]}
                            >
                              <SqlMonacoEditor
                                disabled={disabled}
                                maxHeight={200}
                                placeholder='SELECT * FROM db_name.table_name'
                                theme={darkMode ? 'dark' : 'light'}
                                enableAutocomplete={true}
                                enableFormat
                                renderFormatButton={() => {
                                  return (
                                    <Tooltip title={t('common:format_sql')}>
                                      <Button size='small' type='text' icon={<WandSparkles size={12} strokeWidth={1} />} />
                                    </Tooltip>
                                  );
                                }}
                              />
                            </Form.Item>
                          </InputGroupWithFormItem>
                        </div>
                      </Col>
                      <Col flex='none'>
                        <InputGroupWithFormItem
                          label={t('datasource:es.interval')}
                          addonAfter={
                            <Form.Item {...field} name={[field.name, 'interval_unit']} noStyle initialValue='min'>
                              <Select disabled={disabled} dropdownMatchSelectWidth={false}>
                                <Select.Option value='second'>{t('common:time.second')}</Select.Option>
                                <Select.Option value='min'>{t('common:time.minute')}</Select.Option>
                                <Select.Option value='hour'>{t('common:time.hour')}</Select.Option>
                              </Select>
                            </Form.Item>
                          }
                        >
                          <Form.Item {...field} name={[field.name, 'interval']} noStyle>
                            <InputNumber disabled={disabled} style={{ width: 80 }} />
                          </Form.Item>
                        </InputGroupWithFormItem>
                      </Col>
                      <Col flex='none'>
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
                      </Col>
                      <Col flex='none'>
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
                      </Col>
                    </Row>
                  </CardContainerHeader>
                  <AdvancedSettings mode='graph' prefixField={field} prefixName={[field.name]} disabled={disabled} showUnit={IS_PLUS} expanded />
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue }) => {
                      const cate = getFieldValue('cate');
                      const query = getFieldValue([...fullPrefixName, ...prefixName, 'queries', field.name]);

                      return <GraphPreview cate={cate} datasourceValue={datasourceID} query={query} />;
                    }}
                  </Form.Item>
                </CardContainer>
              );
            })}
            <Button
              className='w-full'
              type='dashed'
              onClick={() => {
                add({
                  interval: 1,
                  interval_unit: 'min',
                });
              }}
              icon={<PlusOutlined />}
            >
              {t('datasource:query.title')}
            </Button>
          </div>
        )}
      </Form.List>
    </>
  );
}
