import React, { useRef, useState } from 'react';
import { Form, Row, Col, Input, Card, InputNumber, Radio, Switch, Space } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined, RightOutlined, DownOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { scrollToFirstError } from '@/utils';
import Name from '@/pages/datasource/components/items/Name';
import Footer from '@/pages/datasource/components/items/Footer';
import Cluster from '@/pages/datasource/components/items/Cluster';
import Description from '@/pages/datasource/components/items/Description';

export default function FormCpt({ action, data, onFinish, submitLoading }: any) {
  const { t } = useTranslation('datasourceManage');
  const [form] = Form.useForm();
  const clusterRef = useRef<any>();
  const names = ['settings'];
  const type = 'ck';

  const [advancedVisible, setAdvancedVisible] = useState(false);

  // 监听 protocol 变化：非 http 时清空 skip_ssl，切回 http 时确保有默认值
  const protocol: string = Form.useWatch([...names, `${type}.protocol`], form);
  const secureConnection: boolean = Form.useWatch([...names, `${type}.secure_connection`], form);

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

        <Form.Item name={[...names, `${type}.is_encrypt`]} initialValue={false} hidden>
          <div />
        </Form.Item>

        <div className='page-title'>{t('endpoint_title')}</div>
        {/* 全局协议选择：HTTP / Native */}
        <Form.Item label={t('form.protocol')} name={[...names, `${type}.protocol`]} initialValue={'native'}>
          <Radio.Group
            value={protocol}
            options={[
              { label: 'Native', value: 'native' },
              { label: 'HTTP', value: 'http' },
            ]}
          ></Radio.Group>
        </Form.Item>

        <Form.List name={[...names, `${type}.nodes`]} initialValue={['']}>
          {(fields, { add, remove }) => (
            <>
              <div className='mb-2 flex items-center'>
                <Space>
                  <div className='text-sm font-medium'>Nodes</div>
                  <PlusCircleOutlined className='cursor-pointer text-lg text-gray-600' onClick={() => add()} />
                </Space>
              </div>
              {fields.map((field) => {
                return (
                  <div key={field.key}>
                    <Row gutter={16}>
                      <Col flex={1}>
                        <Form.Item
                          {...field}
                          name={[field.name]}
                          rules={[
                            {
                              required: true,
                              message: t('form.url_required_msg'),
                            },
                            { pattern: /(^\S)((.)*\S)?(\S*$)/, message: t('form.url_no_spaces_msg') },
                            () => ({
                              validator(_, value) {
                                if (!value) return Promise.resolve();
                                if (/^https?:\/\//i.test(value)) {
                                  return Promise.reject(new Error(t('form.url_no_http_msg') || ''));
                                }
                                return Promise.resolve();
                              },
                            }),
                          ]}
                        >
                          <Input placeholder='localhost:9200' className='w-full' />
                        </Form.Item>
                      </Col>
                      {fields.length > 1 ? (
                        <Col>
                          <MinusCircleOutlined className='cursor-pointer text-lg mt-2 mr-4 text-gray-600' onClick={() => remove(field.name)} />
                        </Col>
                      ) : null}
                    </Row>
                  </div>
                );
              })}
            </>
          )}
        </Form.List>

        <div className='page-title'>{t('auth.name')}</div>
        <Row gutter={16} align='middle' justify='start'>
          <Col>
            <Form.Item label={t('form.secure_connection')} name={[...names, `${type}.secure_connection`]} valuePropName='checked' initialValue={false}>
              <Switch size='small' />
            </Form.Item>
          </Col>

          <Col>
            {secureConnection && (
              <Form.Item label={t('form.skip_ssl_verify')} name={[...names, `${type}.skip_ssl_verify`]} valuePropName='checked' initialValue={false}>
                <Switch size='small' />
              </Form.Item>
            )}
          </Col>
        </Row>

        <Row gutter={16}>
          <Col flex={1}>
            <Form.Item label={t('form.username')} name={[...names, `${type}.user`]}>
              <Input autoComplete='off' className='w-full' />
            </Form.Item>
          </Col>
          <Col flex={1}>
            <Form.Item label={t('form.password')} name={[...names, `${type}.password`]}>
              <Input.Password autoComplete='new-password' className='w-full' />
            </Form.Item>
          </Col>
        </Row>

        <div className='page-title'>{t('form.other')}</div>
        <div className={!advancedVisible ? 'mb-4' : ''}>
          <Space
            className='cursor-pointer'
            onClick={() => {
              setAdvancedVisible(!advancedVisible);
            }}
          >
            {t('common:advanced_settings')}
            {advancedVisible ? <DownOutlined /> : <RightOutlined />}
          </Space>
          <div
            className='mt-2'
            style={{
              display: advancedVisible ? 'block' : 'none',
            }}
          >
            <Row gutter={10}>
              <Col span={12}>
                <Form.Item
                  label={t(`datasource:datasource.timeout_ms`)}
                  name={[...names, `${type}.timeout`]}
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
                    placeholder='100000'
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={t(`datasource:datasource.max_query_rows`)}
                  name={[...names, `${type}.max_query_rows`]}
                  rules={[
                    { required: true },
                    {
                      type: 'number',
                      min: 0,
                    },
                  ]}
                  initialValue={500}
                >
                  <InputNumber
                    style={{
                      width: '100%',
                    }}
                    controls={false}
                  />
                </Form.Item>
              </Col>
              {protocol === 'native' && (
                <>
                  <Col span={6}>
                    <Form.Item
                      label={t(`datasource:datasource.max_idle_conns`)}
                      name={[...names, `${type}.max_idle_conns`]}
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
                        placeholder='10'
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      label={t(`datasource:datasource.max_open_conns`)}
                      name={[...names, `${type}.max_open_conns`]}
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
                        placeholder='100'
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={t(`datasource:datasource.conn_max_lifetime`)}
                      name={[...names, `${type}.conn_max_lifetime`]}
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
                        placeholder='14400'
                      />
                    </Form.Item>
                  </Col>
                </>
              )}
            </Row>
          </div>
        </div>
        <Cluster form={form} clusterRef={clusterRef} />
        <Description />
      </Card>
      <Footer id={data?.id} submitLoading={submitLoading} />
    </Form>
  );
}
