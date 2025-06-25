import React from 'react';
import { Input, Form, InputNumber, Row, Col } from 'antd';
import { MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export default function HTTPList() {
  const { t } = useTranslation('datasourceManage');

  return (
    <div>
      <Form.List name={['settings', 'os.nodes']} initialValue={['']}>
        {(fields, { add, remove }, { errors }) => (
          <>
            <div
              className='page-title'
              style={{
                marginTop: '8px',
              }}
            >
              HTTP
              <PlusCircleOutlined
                style={{
                  marginLeft: '16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                onClick={() => add()}
              />
            </div>
            {fields.map((field, index) => {
              return (
                <Form.Item
                  key={field.key}
                  label={
                    index === 0 ? (
                      <>
                        <span>URL</span>
                      </>
                    ) : null
                  }
                >
                  <Row gutter={16} align='middle'>
                    <Col flex={1}>
                      <Form.Item
                        name={[field.name]}
                        rules={[
                          { required: true },
                          {
                            validator: (_, value) => (!value.includes(' ') ? Promise.resolve() : Promise.reject(new Error(t('form.url_no_spaces_msg')))),
                          },
                        ]}
                        noStyle
                      >
                        <Input placeholder='http://localhost:9200' />
                      </Form.Item>
                    </Col>
                    {fields.length > 1 ? (
                      <Col>
                        <MinusCircleOutlined
                          style={{
                            cursor: 'pointer',
                            fontSize: '14px',
                            margin: '8px 16px 0 0',
                          }}
                          onClick={() => remove(field.name)}
                        />
                      </Col>
                    ) : null}
                  </Row>
                </Form.Item>
              );
            })}
          </>
        )}
      </Form.List>

      <Form.Item
        label={t('form.timeout')}
        name={['settings', 'os.timeout']}
        rules={[
          {
            type: 'number',
            min: 0,
          },
        ]}
        initialValue={100000}
      >
        <InputNumber
          style={{
            width: '100%',
          }}
          controls={false}
        />
      </Form.Item>
    </div>
  );
}
