import React, { useRef, useEffect, useState } from 'react';
import { Form, Row, Col, Input, Card, InputNumber, Radio, Switch, Space } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined, RightOutlined, DownOutlined, CloseOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { scrollToFirstError } from '@/utils';
import Name from '@/pages/datasource/components/items/Name';
import Footer from '@/pages/datasource/components/items/Footer';
import Cluster from '@/pages/datasource/components/items/Cluster';
import { NAME_SPACE } from '@/plugins/clickHouse/constants';

export default function FormCpt({ action, data, onFinish, submitLoading }: any) {
  const { t } = useTranslation('datasourceManage');
  const [form] = Form.useForm();
  const clusterRef = useRef<any>();
  const names = ['settings'];

  const [advancedVisible, setAdvancedVisible] = useState(false);

  // 监听 protocol 变化：非 http 时清空 skip_ssl，切回 http 时确保有默认值
  const protocol = Form.useWatch([...names, 'ck.protocol'], form);

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

          {/* 全局协议选择：HTTP / Native */}
          <Form.Item
            label={t('form.protocol')}
            name={[...names, 'ck.protocol']}
            initialValue={'native'}
          >
            <Radio.Group value={protocol} options={
              [{ label: 'Native', value: 'native' }, { label: 'HTTP', value: 'http' }]
            }>
            </Radio.Group>
          </Form.Item>

          {/* 仅当选择 HTTP 时显示跳过 SSL 开关 */}
          {protocol === 'http' && (
            <Form.Item
              label={t('form.skip_ssl_verify')}
              name={[...names, 'ck.skip_ssl']}
              valuePropName="checked"
              initialValue={false}
            >
              <Switch />
            </Form.Item>
          )}

          <Form.List name={[...names, 'ck.nodes']} initialValue={['']}>
            {(fields, { add, remove }, { errors }) => (
              <>
                <div className='mt-2 flex items-center justify-between'>
                  <div className='text-sm font-medium'>Nodes</div>
                  <PlusCircleOutlined
                    className='ml-4 cursor-pointer text-lg text-gray-600'
                    onClick={() => add()}
                  />
                </div>
                {fields.map((field, index) => {
                  return (
                    <div key={field.key} className='mb-4'>
                      <Form.Item
                        label={index === 0 ? <span className='text-sm font-medium'>URL</span> : null}
                        required
                      >
                        <Row gutter={16} align='middle' className='items-center'>
                          <Col flex={1}>
                            <Form.Item
                              {...field}
                              name={[field.name]}
                              rules={[
                                {
                                  required: true,
                                },
                                { pattern: /(^\S)((.)*\S)?(\S*$)/, message: t('form.url_no_spaces_msg') },
                              ]}
                              noStyle
                            >
                              <Input placeholder='http://localhost:9200' className='w-full' />
                            </Form.Item>
                          </Col>
                          {fields.length > 1 ? (
                            <Col>
                              <MinusCircleOutlined
                                className='cursor-pointer text-lg mt-2 mr-4 text-gray-600'
                                onClick={() => remove(field.name)}
                              />
                            </Col>
                          ) : null}
                        </Row>
                      </Form.Item>
                    </div>
                  );
                })}
              </>
            )}
          </Form.List>

          <Row gutter={16} className='mb-4'>
            <Col flex={1}>
              <Form.Item label={t('form.username')} name={[...names, 'ck.user']}>
                <Input autoComplete='off' className='w-full' />
              </Form.Item>
            </Col>
            <Col flex={1}>
              <Form.Item label={t('form.password')} name={[...names, 'ck.password']}>
                <Input.Password autoComplete='new-password' className='w-full' />
              </Form.Item>
            </Col>
          </Row>
        </div>

        <Cluster form={form} clusterRef={clusterRef} />

        {/* 高级设置 */}
        <div className='mt-4'>
          <div
            className='inline-flex items-center gap-2 cursor-pointer text-sm text-gray-700 select-none'
            onClick={() => setAdvancedVisible(!advancedVisible)}
          >
            <span>{t('common:advanced_settings')}</span>
            {advancedVisible ? <DownOutlined /> : <RightOutlined />}
          </div>

          <div className={`${advancedVisible ? 'block' : 'hidden'} mt-2`}>
            <Row gutter={16}>
              <Col flex={1}>
                <Form.Item
                  label={t('form.timeout')}
                  name={[...names, 'ck.timeout']}
                  rules={[{ type: 'number', min: 0 }]}
                >
                  <InputNumber className='w-full' controls={false} />
                </Form.Item>
              </Col>
              <Col flex={1}>
                <Form.Item
                  label={t(`${NAME_SPACE}:datasource.max_query_rows`)}
                  name={[...names, 'ck.max_query_rows']}
                  rules={[{ required: true, type: 'number', min: 0 }]}
                >
                  <InputNumber className='w-full' controls={false} />
                </Form.Item>
              </Col>
            </Row>

            {/* Native 模式下的高级配置 */}
            {protocol === 'native' ? (
              <Row gutter={16} className='mt-4'>
                <Col flex={1}>
                  <Form.Item
                    label={t(`${NAME_SPACE}:datasource.max_idle_conns`)}
                    name={[...names, 'ck.max_idle_conns']}
                    rules={[{ type: 'number', min: 0 }]}
                  >
                    <InputNumber className='w-full' controls={false} />
                  </Form.Item>
                </Col>

                <Col flex={1}>
                  <Form.Item
                    label={t(`${NAME_SPACE}:datasource.max_open_conns`)}
                    name={[...names, 'ck.max_open_conns']}
                    rules={[{ type: 'number', min: 0 }]}
                  >
                    <InputNumber className='w-full' controls={false} />
                  </Form.Item>
                </Col>

                <Col flex={1}>
                  <Form.Item
                    label={t(`${NAME_SPACE}:datasource.conn_max_lifetime`)}
                    name={[...names, 'ck.conn_max_lifetime']}
                    rules={[{ type: 'number', min: 0 }]}
                  >
                    <InputNumber className='w-full' controls={false} />
                  </Form.Item>
                </Col>
              </Row>
            ) : null}
          </div>
        </div>
      </Card>
      <Footer id={data?.id} submitLoading={submitLoading} />
    </Form >
  );
}
