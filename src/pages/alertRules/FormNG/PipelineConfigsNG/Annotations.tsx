import React from 'react';
import { Form, Space, Row, Col, AutoComplete, Input } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import CardContainer, { CardContainerHeader } from '@/pages/alertRules/FormNG/components/CardContainer';

export default function Annotations() {
  const { t } = useTranslation('alertRules');

  return (
    <>
      <div
        className='my-4'
        style={{
          borderBottom: '1px solid var(--fc-border-color)',
        }}
      />
      <Form.List name='annotations'>
        {(fields, { add, remove }) => (
          <div>
            <Space align='baseline'>
              {t('annotations')}
              <PlusCircleOutlined className='leading-[32px]' onClick={() => add()} />
            </Space>
            {fields.map((field) => (
              <CardContainer className='pb-0' key={field.key} onClose={() => remove(field.name)}>
                <CardContainerHeader>
                  <Row gutter={16}>
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
                  </Row>
                </CardContainerHeader>
              </CardContainer>
            ))}
          </div>
        )}
      </Form.List>
    </>
  );
}
