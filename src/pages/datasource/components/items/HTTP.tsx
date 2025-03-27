import React from 'react';
import { Input, Form, InputNumber, Row, Col, Space } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

interface IProps {
  urlExtra?: React.ReactNode;
  placeholder?: string;
  multipleUrls?: boolean;
}

const FormItem = Form.Item;

export default function HTTP(props: IProps) {
  const { t } = useTranslation('datasourceManage');
  const { urlExtra, placeholder, multipleUrls } = props;

  return (
    <div>
      {multipleUrls ? (
        <>
          <Form.List name={['http', 'urls']} initialValue={['']}>
            {(fields, { add, remove }, { errors }) => (
              <>
                <div className='page-title'>
                  <Space>
                    HTTP
                    <PlusCircleOutlined
                      onClick={() => {
                        add('');
                      }}
                    />
                  </Space>
                </div>
                {fields.map((field) => (
                  <Row gutter={10}>
                    <Col flex='auto'>
                      <FormItem {...field} key={field.key} rules={[{ required: true }]}>
                        <Input placeholder={placeholder || 'http://localhost:9090'} />
                      </FormItem>
                    </Col>
                    {fields.length > 1 ? (
                      <Col flex='none'>
                        <MinusCircleOutlined
                          style={{
                            height: '32px',
                            lineHeight: '32px',
                          }}
                          onClick={() => remove(field.name)}
                        />
                      </Col>
                    ) : null}
                  </Row>
                ))}

                <Form.ErrorList errors={errors} />
              </>
            )}
          </Form.List>
        </>
      ) : (
        <>
          <div className='page-title'>HTTP</div>
          <FormItem
            label='URL'
            name={['http', 'url']}
            rules={[
              { required: true },
              {
                validator: (_rule, value) => (!_.includes(value, ' ') ? Promise.resolve() : Promise.reject(new Error(t('form.url_no_spaces_msg')))),
              },
            ]}
          >
            <Input placeholder={placeholder || 'http://localhost:9090'} />
          </FormItem>
        </>
      )}
      {urlExtra}
      <FormItem label={t('form.timeout')} name={['http', 'timeout']} rules={[{ type: 'number', min: 0 }]} initialValue={10000}>
        <InputNumber style={{ width: '100%' }} controls={false} />
      </FormItem>
    </div>
  );
}
