import React, { useContext } from 'react';
import { Form, Space, Input, Row, Col, InputNumber, Tooltip, Select } from 'antd';
import { PlusCircleOutlined, CloseCircleOutlined, InfoCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';
import { SqlMonacoEditor } from '@fc-components/monaco-editor';

import { CommonStateContext } from '@/App';
import { alphabet } from '@/utils/constant';
import DocumentDrawer from '@/components/DocumentDrawer';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import EnhancedModal from '@/pages/alertRules/Form/components/EnhancedModal';
import { normalizeTime } from '@/pages/alertRules/Form/utils';

import { NAME_SPACE } from '../../constants';
import GraphPreview from '../GraphPreview';

interface IProps {
  prefixField?: any;
  fullPrefixName?: string[];
  prefixName?: string[];
  disabled?: boolean;
}

export default function index({ prefixField = {}, fullPrefixName = [], prefixName = ['extra_config'], disabled }: IProps) {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);

  const names = [...prefixName, 'enrich_queries'];
  const mainQueries = Form.useWatch(['rule_config', 'queries']) || [];

  return (
    <>
      <Form.List {...prefixField} name={names}>
        {(fields, { add, remove }) => (
          <div>
            <div className='mb-2'>
              <Space>
                {t('enrich_queries.title')}
                <PlusCircleOutlined
                  onClick={() => {
                    EnhancedModal({
                      queries: mainQueries,
                      add,
                    });
                  }}
                />
              </Space>
            </div>
            {fields.map((field, index) => {
              return (
                <div key={field.key} className='bg-fc-200 p-4 mb-4 relative'>
                  <Row gutter={8}>
                    <Col flex='32px'>
                      <Form.Item>
                        <Input readOnly style={{ width: 32 }} value={alphabet[index]} />
                      </Form.Item>
                    </Col>
                    <Col flex='auto'>
                      <InputGroupWithFormItem
                        label={
                          <Space>
                            {t(`${NAME_SPACE}:query.query`)}
                            <InfoCircleOutlined
                              onClick={() => {
                                DocumentDrawer({
                                  language: i18n.language === 'zh_CN' ? 'zh_CN' : 'en_US',
                                  title: t('common:document_title'),
                                  type: 'iframe',
                                  documentPath: 'https://flashcat.cloud/docs/content/flashcat/log/discover/what-is-sql-mode-in-doris-discover/',
                                });
                              }}
                            />
                          </Space>
                        }
                      >
                        <Form.Item
                          {...field}
                          name={[field.name, 'sql']}
                          rules={[
                            {
                              required: true,
                              message: t('annotation_qd.query_required'),
                            },
                            () => ({
                              validator(_, value) {
                                // 验证 SQL 语句中是否包含 LIMIT 子句
                                if (typeof value === 'string' && /limit\s+\d+/i.test(value)) {
                                  return Promise.resolve();
                                }
                                return Promise.reject(new Error(t('annotation_qd.sql_limit_valid')));
                              },
                            }),
                          ]}
                        >
                          <SqlMonacoEditor
                            theme={darkMode ? 'dark' : 'light'}
                            placeholder='SELECT count(*) as count FROM db_name.table_name LIMIT 10'
                            editorDidMount={(editor) => {
                              editor.onKeyDown((e) => {
                                if (e.code === 'Escape') {
                                  e.stopPropagation();
                                }
                              });
                            }}
                          />
                        </Form.Item>
                      </InputGroupWithFormItem>
                    </Col>
                  </Row>
                  <div>
                    <Space>
                      <InputGroupWithFormItem
                        label={
                          <Space>
                            {t('query.interval')}
                            <Tooltip
                              title={
                                <Trans
                                  ns={NAME_SPACE}
                                  i18nKey='query.interval_tip'
                                  components={{
                                    br: <br />,
                                  }}
                                />
                              }
                            >
                              <QuestionCircleOutlined />
                            </Tooltip>
                          </Space>
                        }
                        addonAfter={
                          <Form.Item {...field} name={[field.name, 'interval_unit']} initialValue='min'>
                            <Select disabled={disabled} style={{ width: 80 }}>
                              <Select.Option value='second'>{t('common:time.second')}</Select.Option>
                              <Select.Option value='min'>{t('common:time.minute')}</Select.Option>
                              <Select.Option value='hour'>{t('common:time.hour')}</Select.Option>
                            </Select>
                          </Form.Item>
                        }
                      >
                        <Form.Item {...field} name={[field.name, 'interval']} initialValue={1}>
                          <InputNumber disabled={disabled} style={{ width: 80 }} min={0} />
                        </Form.Item>
                      </InputGroupWithFormItem>
                      <InputGroupWithFormItem
                        label={
                          <Space>
                            {t('query.offset')}
                            <Tooltip
                              title={
                                <Trans
                                  ns={NAME_SPACE}
                                  i18nKey='query.offset_tip'
                                  components={{
                                    br: <br />,
                                  }}
                                />
                              }
                            >
                              <QuestionCircleOutlined />
                            </Tooltip>
                          </Space>
                        }
                      >
                        <Form.Item {...field} name={[field.name, 'offset']} initialValue={0}>
                          <InputNumber addonAfter={t('common:time.second')} min={0} className='w-full' />
                        </Form.Item>
                      </InputGroupWithFormItem>
                    </Space>
                  </div>
                  <CloseCircleOutlined
                    style={{ position: 'absolute', right: -4, top: -4 }}
                    onClick={() => {
                      remove(field.name);
                    }}
                  />
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue }) => {
                      const cate = getFieldValue('cate');
                      const datasourceValue = getFieldValue('datasource_value');
                      const query = getFieldValue([...fullPrefixName, ...names, field.name]);
                      const intervalValue = query ? normalizeTime(query.interval, query.interval_unit) : undefined;

                      return <GraphPreview cate={cate} datasourceValue={datasourceValue} sql={query?.sql} interval={intervalValue} offset={query?.offset} />;
                    }}
                  </Form.Item>
                </div>
              );
            })}
          </div>
        )}
      </Form.List>
    </>
  );
}
