import React, { useContext } from 'react';
import { Form, Space, Row, Col, Card, Input } from 'antd';
import { PlusCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import QueryName, { generateQueryName } from '@/components/QueryName';
import DocumentDrawer from '@/components/DocumentDrawer';

import { NAME_SPACE } from '../../constants';
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
                <div key={field.key} className='bg-fc-200 p-4 mb-4 relative' style={{ padding: 16, marginBottom: 16, position: 'relative' }}>
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
                                    documentPath: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v8/usage/alert/query-data/victorialogs/',
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
                  <Form.Item shouldUpdate noStyle>
                    {({ getFieldValue }) => {
                      const query = getFieldValue([...fullPrefixName, ...prefixName, 'queries', field.name]);

                      return <GraphPreview datasourceValue={datasourceID} query={query} />;
                    }}
                  </Form.Item>
                  {fields.length > 1 && (
                    <CloseCircleOutlined
                      style={{ position: 'absolute', right: -4, top: -4 }}
                      onClick={() => {
                        remove(field.name);
                      }}
                    />
                  )}
                </div>
              );
            })}
          </Card>
        )}
      </Form.List>
    </>
  );
}
