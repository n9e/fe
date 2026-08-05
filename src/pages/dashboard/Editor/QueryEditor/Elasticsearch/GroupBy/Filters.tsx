import React from 'react';
import { Form, Select, Row, Col, Input, Space } from 'antd';
import type { FormListFieldData } from 'antd/lib/form/FormList';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { groupByCates } from './configs';

export default function Filters({ prefixField }: { prefixField: FormListFieldData }) {
  const { t } = useTranslation('alertRules');
  const restPrefixField = _.omit(prefixField, 'key');
  return (
    <>
      <Form.Item {...restPrefixField} name={[prefixField.name, 'cate']}>
        <Select style={{ width: '100%' }} optionLabelProp='value'>
          {groupByCates.map((func) => (
            <Select.Option key={func} value={func}>
              {func} ({t(`datasource:es.${func}.label`)})
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.List {...restPrefixField} name={[prefixField.name, 'params']}>
        {(fields, { add, remove }) => {
          return (
            <div>
              {fields.map((field, index) => {
                const restField = _.omit(field, 'key');
                return (
                  <Row gutter={16} key={field.key} style={{ marginBottom: index < fields.length - 1 ? 16 : 0 }}>
                    <Col flex='auto'>
                      <Row gutter={16}>
                        <Col flex={12}>
                          <Form.Item {...restField} name={[field.name, 'query']} noStyle>
                            <Input addonBefore='Query' />
                          </Form.Item>
                        </Col>
                        <Col flex={12}>
                          <Form.Item {...restField} name={[field.name, 'alias']} noStyle>
                            <Input addonBefore='Alias' />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                    <Col flex='40px' style={{ display: 'flex', alignItems: 'center' }}>
                      <Space>
                        <PlusCircleOutlined
                          style={{
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            add({
                              alias: '',
                              query: '',
                            });
                          }}
                        />
                        {fields.length > 1 && (
                          <MinusCircleOutlined
                            style={{
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              remove(field.name);
                            }}
                          />
                        )}
                      </Space>
                    </Col>
                  </Row>
                );
              })}
            </div>
          );
        }}
      </Form.List>
    </>
  );
}
