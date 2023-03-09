import React from 'react';
import { Form, Select, Row, Col, Input, Space } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { groupByCates, groupByCatesMap } from './configs';

export default function Filters({ prefixField }) {
  return (
    <>
      <Form.Item {...prefixField} name={[prefixField.name, 'cate']}>
        <Select style={{ width: '100%' }} optionLabelProp='value'>
          {groupByCates.map((func) => (
            <Select.Option key={func} value={func}>
              {func} ({groupByCatesMap[func]})
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.List {...prefixField} name={[prefixField.name, 'params']}>
        {(fields, { add, remove }) => {
          return (
            <div>
              {fields.map((field, index) => {
                return (
                  <Row gutter={16} key={field.key} style={{ marginBottom: index < fields.length - 1 ? 16 : 0 }}>
                    <Col flex='auto'>
                      <Row gutter={16}>
                        <Col flex={12}>
                          <Form.Item {...field} name={[field.name, 'query']} noStyle>
                            <Input addonBefore='Query' />
                          </Form.Item>
                        </Col>
                        <Col flex={12}>
                          <Form.Item {...field} name={[field.name, 'alias']} noStyle>
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
