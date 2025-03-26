import React, { useRef } from 'react';
import { Form, Row, Col, Input, Card, InputNumber } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { scrollToFirstError } from '@/utils';
import Name from '@/pages/datasource/components/items/Name';
import Description from '@/pages/datasource/components/items/Description';
import Footer from '@/pages/datasource/components/items/Footer';
import Cluster from '@/pages/datasource/components/items/Cluster';
import { NAME_SPACE } from '@/plugins/clickHouse/constants';

export default function FormCpt({ action, data, onFinish, submitLoading }: any) {
  const { t } = useTranslation('datasourceManage');
  const [form] = Form.useForm();
  const clusterRef = useRef<any>();
  const names = ['settings'];

  return (
    <Form
      form={form}
      layout='vertical'
      onFinish={(values) => {
        onFinish(values, clusterRef.current);
      }}
      onFinishFailed={() => {
        scrollToFirstError();
      }}
      initialValues={data}
      className='settings-source-form'
    >
      <Card title={t(`${action}_title`)}>
        <Name />
        <div>
          <Form.Item name={[...names, 'ck.is_encrypt']} initialValue={false} hidden>
            <div />
          </Form.Item>
          <Form.List name={[...names, 'ck.nodes']} initialValue={['']}>
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
                      required
                    >
                      <Row gutter={16} align='middle'>
                        <Col flex={1}>
                          <Form.Item
                            name={[field.name]}
                            rules={[
                              {
                                required: true,
                              },
                              { pattern: /(^\S)((.)*\S)?(\S*$)/, message: t('form.url_no_spaces_msg') },
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
            name={[...names, 'ck.timeout']}
            rules={[
              {
                type: 'number',
                min: 0,
              },
            ]}
          >
            <InputNumber
              style={{
                width: '100%',
              }}
              controls={false}
            />
          </Form.Item>
          <Form.Item
            label={t(`${NAME_SPACE}:datasource.max_query_rows`)}
            name={[...names, 'ck.max_query_rows']}
            rules={[
              { required: true },
              {
                type: 'number',
                min: 0,
              },
            ]}
          >
            <InputNumber
              style={{
                width: '100%',
              }}
              controls={false}
            />
          </Form.Item>
          <Row gutter={16}>
            <Col flex={'1'}>
              <Form.Item label={t('form.username')} name={[...names, 'ck.user']}>
                <Input autoComplete='off' />
              </Form.Item>
            </Col>
            <Col flex={'1'}>
              <Form.Item label={t('form.password')} name={[...names, 'ck.password']}>
                <Input.Password autoComplete='new-password' />
              </Form.Item>
            </Col>
          </Row>
        </div>
        <Cluster form={form} clusterRef={clusterRef} />
        <Description />
      </Card>
      <Footer id={data?.id} submitLoading={submitLoading} />
    </Form>
  );
}
