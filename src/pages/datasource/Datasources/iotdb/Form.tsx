import React, { useRef } from 'react';
import { Form, Card, Input, InputNumber, Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { scrollToFirstError } from '@/utils';
import Name from '../../components/items/Name';
import HTTP from '../../components/items/HTTP';
import BasicAuth from '../../components/items/BasicAuth';
import SkipTLSVerify from '../../components/items/SkipTLSVerify';
import Headers from '../../components/items/Headers';
import Description from '../../components/items/Description';
import Footer from '../../components/items/Footer';
import Cluster from '../../components/items/Cluster';

export default function FormCpt({ action, data, onFinish, submitLoading }: any) {
  const { t } = useTranslation('datasourceManage');
  const [form] = Form.useForm();
  const clusterRef = useRef<any>();

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
      initialValues={{
        http: {
          url: 'http://localhost:18080',
        },
        ...data,
      }}
      className='settings-source-form'
    >
      <Card title={t(`${action}_title`)}>
        <Name />
        <HTTP placeholder='http://localhost:18080' />
        <div className='page-title'>RPC / Table Model</div>
        <Row gutter={16}>
          <Col flex='1'>
            <Form.Item label='RPC address' name={['settings', 'iotdb.rpc_addr']}>
              <Input placeholder='127.0.0.1:6667' />
            </Form.Item>
          </Col>
          <Col flex='1'>
            <Form.Item label='Default database' name={['settings', 'iotdb.database']}>
              <Input placeholder='database_name' />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col flex='1'>
            <Form.Item
              label='RPC connection timeout (ms)'
              name={['settings', 'iotdb.dial_timeout']}
              initialValue={10000}
              rules={[
                { required: true, message: 'Please enter the RPC connection timeout' },
                { type: 'number', min: 1, message: 'RPC connection timeout must be at least 1 ms' },
              ]}
            >
              <InputNumber className='w-full' controls={false} />
            </Form.Item>
          </Col>
          <Col flex='1'>
            <Form.Item
              label='RPC query timeout (ms)'
              name={['settings', 'iotdb.timeout']}
              initialValue={30000}
              rules={[
                { required: true, message: 'Please enter the RPC query timeout' },
                { type: 'number', min: 1, message: 'RPC query timeout must be at least 1 ms' },
              ]}
            >
              <InputNumber className='w-full' controls={false} />
            </Form.Item>
          </Col>
        </Row>
        <BasicAuth />
        <SkipTLSVerify />
        <Headers />
        <Cluster form={form} clusterRef={clusterRef} />
        <Description />
      </Card>
      <Footer id={data?.id} submitLoading={submitLoading} />
    </Form>
  );
}
