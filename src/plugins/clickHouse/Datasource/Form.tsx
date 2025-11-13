import React, { useRef, useEffect, useState } from 'react';
import { Form, Row, Col, Input, Card, InputNumber, Radio, Switch, Space } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined, RightOutlined, DownOutlined } from '@ant-design/icons';
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

  // 控制高级设置折叠显示（与 mysql 片段风格一致）
  const [advancedVisible, setAdvancedVisible] = useState(false);

  // 监听 protocol 变化：非 http 时清空 skip_ssl，切回 http 时确保有默认值
  const protocol = Form.useWatch([...names, 'ck.protocol'], form);
  useEffect(() => {
    if (protocol === 'http') {
      // 保证存在默认值（用户可切回后看到）
      if (form.getFieldValue([...names, 'ck.skip_ssl']) === undefined) {
        form.setFields([{ name: [...names, 'ck.skip_ssl'], value: false }]);
      }
    } else {
      // 非 http 时清理该字段，避免残留为 true 导致逻辑/显示异常
      if (form.getFieldValue([...names, 'ck.skip_ssl'])) {
        form.setFields([{ name: [...names, 'ck.skip_ssl'], value: false }]);
      }
    }
  }, [protocol, form]);

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
          <Form.Item dependencies={[...names, 'ck.protocol']} noStyle>
            {({ getFieldValue }) => {
              const protocol = getFieldValue([...names, 'ck.protocol']);
              return protocol === 'http' ? (
                <Form.Item
                  label={t('form.skip_ssl_verify')}
                  name={[...names, 'ck.skip_ssl']}
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Switch />
                </Form.Item>
              ) : null;
            }}
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

          {/* Native 模式下显示横向的连接配置：最大空闲连接数 / 最大打开连接数 / 连接生命周期（秒） */}

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

        {/* 高级设置：与项目其它表单风格一致，点击展开/收起 */}
        <div style={{ marginTop: 16 }}>
          <Space className='cursor-pointer' onClick={() => setAdvancedVisible(!advancedVisible)}>
            {t('common:advanced_settings')}
            {advancedVisible ? <DownOutlined /> : <RightOutlined />}
          </Space>

          <div className='mt-2' style={{ display: advancedVisible ? 'block' : 'none' }}>
            <Row gutter={16}>
              <Col flex={1}>
                <Form.Item
                  label={t('form.timeout')}
                  name={[...names, 'ck.timeout']}
                  rules={[{ type: 'number', min: 0 }]}
                >
                  <InputNumber style={{ width: '100%' }} controls={false} />
                </Form.Item>
              </Col>
              <Col flex={1}>
                <Form.Item
                  label={t(`${NAME_SPACE}:datasource.max_query_rows`)}
                  name={[...names, 'ck.max_query_rows']}
                  rules={[{ required: true, type: 'number', min: 0 }]}
                >
                  <InputNumber style={{ width: '100%' }} controls={false} />
                </Form.Item>
              </Col>
            </Row>

            {/* Native 模式下显示横向的连接配置 */}
            {protocol === 'native' ? (
              <Row gutter={16} style={{ marginTop: 8 }}>
                <Col flex={1}>
                  <Form.Item
                    label={t(`${NAME_SPACE}:datasource.max_idle_conns`)}
                    name={[...names, 'ck.max_idle_conns']}
                    rules={[{ type: 'number', min: 0 }]}
                  >
                    <InputNumber style={{ width: '100%' }} controls={false} />
                  </Form.Item>
                </Col>

                <Col flex={1}>
                  <Form.Item
                    label={t(`${NAME_SPACE}:datasource.max_open_conns`)}
                    name={[...names, 'ck.max_open_conns']}
                    rules={[{ type: 'number', min: 0 }]}
                  >
                    <InputNumber style={{ width: '100%' }} controls={false} />
                  </Form.Item>
                </Col>

                <Col flex={1}>
                  <Form.Item
                    label={t(`${NAME_SPACE}:datasource.conn_max_lifetime`)}
                    name={[...names, 'ck.conn_max_lifetime']}
                    rules={[{ type: 'number', min: 0 }]}
                  >
                    <InputNumber style={{ width: '100%' }} controls={false} />
                  </Form.Item>
                </Col>
              </Row>
            ) : null}
          </div>
        </div>
      </Card>
      <Footer id={data?.id} submitLoading={submitLoading} />
    </Form>
  );
}
