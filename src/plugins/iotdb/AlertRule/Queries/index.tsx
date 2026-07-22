import React, { useContext } from 'react';
import { Form, Space, Row, Col, InputNumber, Select, Tooltip, Button } from 'antd';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { WandSparkles } from 'lucide-react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { SqlMonacoEditor } from '@fc-components/monaco-editor';
import { DatasourceCateEnum, IS_PLUS } from '@/utils/constant';
import DocumentDrawer from '@/components/DocumentDrawer';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import CardContainer, { CardContainerHeader } from '@/pages/alertRules/FormNG/components/CardContainer';
import FormItemLabel from '@/pages/alertRules/FormNG/components/FormItemLabel';
import AdvancedSettings from '../../components/AdvancedSettings';
import QueryName, { generateQueryName } from '@/components/QueryName';
import { MetaModal } from '../../components/Meta';
import GraphPreview from './GraphPreview';

interface IProps {
  form: any;
  prefixField?: any;
  fullPrefixName?: string[];
  prefixName?: string[];
  disabled?: boolean;
  datasourceValue: number | number[];
}

export default function IotDBAlertRuleQueries({ form, prefixField = {}, fullPrefixName = [], prefixName = [], disabled, datasourceValue }: IProps) {
  const { t, i18n } = useTranslation('db_iotdb');
  const { darkMode } = useContext(CommonStateContext);
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
        <div>
          <FormItemLabel>{t('datasource:query.title')}</FormItemLabel>
          {fields.map((field) => {
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
                                    documentPath: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-rules/query-data/iotdb/',
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
                            placeholder='SELECT * FROM table_name'
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
                    </Col>
                  </Row>
                </CardContainerHeader>
                <AdvancedSettings
                  mode='graph'
                  prefixField={field}
                  prefixName={[field.name]}
                  disabled={disabled}
                  showUnit={IS_PLUS}
                  expanded
                  datasourceCate={DatasourceCateEnum.iotdb}
                />
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
  );
}
