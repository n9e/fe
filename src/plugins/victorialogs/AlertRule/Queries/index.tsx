import React, { useContext } from 'react';
import { Form, Space, Row, Col, Input, Alert, Button } from 'antd';
import { PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import CardContainer, { CardContainerHeader } from '@/pages/alertRules/FormNG/components/CardContainer';
import FormItemLabel from '@/pages/alertRules/FormNG/components/FormItemLabel';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';

import { CommonStateContext } from '@/App';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import QueryName, { generateQueryName } from '@/components/QueryName';
import DocumentDrawer from '@/components/DocumentDrawer';

import { NAME_SPACE, DEFAULT_QUERY } from '../../constants';
import GraphPreview from './GraphPreview';

interface IProps {
  prefixField?: any;
  fullPrefixName?: string[]; // 完整的前置字段名，用于 getFieldValue 获取指定字段的值
  prefixName?: string[]; // 列表字段名
  disabled?: boolean;
  datasourceValue: number | number[];
}

export default function index({ prefixField = {}, fullPrefixName = [], prefixName = [], disabled, datasourceValue }: IProps) {
  const { t, i18n } = useTranslation(NAME_SPACE);
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
            query: DEFAULT_QUERY,
          },
        ]}
      >
        {(fields, { add, remove }) => (
          <div>
            <FormItemLabel>{t('datasource:query.title')}</FormItemLabel>
            {fields.map((field) => {
              return (
                <CardContainer key={field.key} onClose={fields.length > 1 ? () => remove(field.name) : undefined}>
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue }) => {
                      const query = getFieldValue([...fullPrefixName, ...prefixName, 'queries', field.name]);
                      const queryValue = query?.query;
                      if (!queryValue || _.includes(queryValue, '_time')) return null;
                      return <Alert className='mb-2' type='warning' message={<Trans ns={NAME_SPACE} i18nKey='alert.query_warning_no_time' components={{ b: <strong /> }} />} />;
                    }}
                  </Form.Item>
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
                                {t('explorer.query')}
                                <InfoCircleOutlined
                                  onClick={() => {
                                    DocumentDrawer({
                                      language: i18n.language,
                                      darkMode,
                                      title: t('common:page_help'),
                                      type: 'iframe',
                                      documentPath:
                                        'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-rules/query-data/victorialogs/',
                                    });
                                  }}
                                />
                              </Space>
                            }
                          >
                            <Form.Item {...field} name={[field.name, 'query']}>
                              <Input.TextArea autoSize={{ minRows: 0 }} />
                            </Form.Item>
                          </InputGroupWithFormItem>
                        </div>
                      </Col>
                    </Row>
                  </CardContainerHeader>
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue }) => {
                      const query = getFieldValue([...fullPrefixName, ...prefixName, 'queries', field.name]);

                      return <GraphPreview datasourceValue={datasourceID} query={query} />;
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
                  query: DEFAULT_QUERY,
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
