import React from 'react';
import { Form, Space, Row, Col, AutoComplete, Input } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export default function Annotations() {
  const { t } = useTranslation('alertRules');

  return (
    <Form.List name='annotations'>
      {(fields, { add, remove }) => (
        <div>
          <Space align='baseline'>
            {t('annotations')}
            <PlusCircleOutlined className='control-icon-normal' onClick={() => add()} />
          </Space>
          {fields.map((field) => (
            <Row gutter={16} key={field.key}>
              <Col flex='120px'>
                <Form.Item {...field} name={[field.name, 'key']}>
                  <AutoComplete
                    options={[
                      {
                        value: 'recovery_promql',
                      },
                      {
                        value: 'runbook_url',
                      },
                      {
                        value: 'dashboard_url',
                      },
                      {
                        value: 'summary',
                      },
                    ]}
                    style={{ width: 200 }}
                  />
                </Form.Item>
              </Col>
              <Col flex='auto'>
                <Form.Item {...field} name={[field.name, 'value']}>
                  <Input.TextArea autoSize />
                </Form.Item>
              </Col>
              <Col flex='40px'>
                <MinusCircleOutlined className='control-icon-normal' onClick={() => remove(field.name)} />
              </Col>
            </Row>
          ))}
        </div>
      )}
    </Form.List>
  );
}
