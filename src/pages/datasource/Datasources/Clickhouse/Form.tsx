import React, { useRef } from 'react';
import { Form, Row, Col, Input } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import Name from '../../components/items/Name';
import Description from '../../components/items/Description';
import Footer from '../../components/items/Footer';
import Cluster from '../../components/items/Cluster';

export default function FormCpt({ data, onFinish, submitLoading }: any) {
  const { t } = useTranslation('datasourceManage');
  const [form] = Form.useForm();
  const clusterRef = useRef<any>();
  const names = ['settings', 'ck.shards', 0];

  return (
    <Form
      form={form}
      layout='vertical'
      onFinish={(values) => {
        onFinish(values, clusterRef.current);
      }}
      initialValues={data}
      className='settings-source-form'
    >
      <Name />
      <div>
        <div className='page-title'>{t('form.ck.title')}</div>
        <Form.Item label={t('form.ck.addr')} name={[...names, 'ck.addr']} rules={[{ required: true }]}>
          <Input placeholder='http://localhost:9090' />
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
      <div className='mt16'>
        <Footer id={data?.id} submitLoading={submitLoading} />
      </div>
    </Form>
  );
}
