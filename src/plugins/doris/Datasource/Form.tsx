import React, { useRef } from 'react';
import { Form, Input, InputNumber, Row, Col, Card, Space } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import Name from '@/pages/datasource/components/items/Name';
import Description from '@/pages/datasource/components/items/Description';
import Footer from '@/pages/datasource/components/items/Footer';
import Cluster from '@/pages/datasource/components/items/Cluster';

interface Props {
  action: string; // 'add' | 'edit';
  data: any;
  onFinish: (values: any) => void;
  submitLoading: boolean;
}

export default function Doris(props: Props) {
  const { t } = useTranslation('datasourceManage');
  const { action, data, onFinish, submitLoading } = props;
  const [form] = Form.useForm();
  const clusterRef = useRef<any>();
  const type = 'doris';
  const prefixName = ['settings'];
  const [advancedVisible, setAdvancedVisible] = React.useState(false);

  return (
    <Form form={form} layout='vertical' onFinish={onFinish} initialValues={data} className='settings-source-form'>
      <Card title={t(`datasourceManage:${action}_title`)}>
        <Name />
        <div className='page-title'>FE node</div>
        <Form.Item
          label='URL'
          name={['settings', 'doris.addr']}
          rules={[
            { required: true },
            {
              validator: (_, value) => (!value.includes(' ') ? Promise.resolve() : Promise.reject(new Error(t('form.url_no_spaces_msg')))),
            },
          ]}
        >
          <Input placeholder={'localhost:9030'} />
        </Form.Item>
        <div className={!advancedVisible ? 'mb-2' : ''}>
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
                  name={[...prefixName, `${type}.timeout`]}
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
                  name={[...prefixName, `${type}.max_query_rows`]}
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
              <Col span={6}>
                <Form.Item
                  label={t(`datasource:datasource.max_idle_conns`)}
                  name={[...prefixName, `${type}.max_idle_conns`]}
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
                  name={[...prefixName, `${type}.max_open_conns`]}
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
                  name={[...prefixName, `${type}.conn_max_lifetime`]}
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
            </Row>
          </div>
        </div>
        <div className='page-title'>{t('form.auth')}</div>
        <Row gutter={16}>
          <Col flex={'1'}>
            <Form.Item label={t('form.username')} name={['settings', 'doris.user']}>
              <Input autoComplete='off' />
            </Form.Item>
          </Col>
          <Col flex={'1'}>
            <Form.Item label={t('form.password')} name={['settings', 'doris.password']}>
              <Input.Password autoComplete='new-password' />
            </Form.Item>
          </Col>
        </Row>
        <Cluster clusterRef={clusterRef} form={form} />
        <Description />
      </Card>
      <Footer id={data?.id} submitLoading={submitLoading} />
    </Form>
  );
}
