import React, { useEffect, useState, useRef } from 'react';
import { Form, Row, Col, Input, Select } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import Name from '../../components/items/Name';
import Description from '../../components/items/Description';
import Footer from '../../components/items/Footer';
import { getServerClusters } from '../../services';

export default function FormCpt({ data, onFinish, submitLoading }: any) {
  const { t } = useTranslation('datasourceManage');
  const [form] = Form.useForm();
  const [clusters, setClusters] = useState<any[]>([]);
  const clusterRef = useRef<any>();
  const names = ['settings'];

  useEffect(() => {
    getServerClusters().then((res) => {
      setClusters(res);
    });
  }, []);

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
        <div className='page-title'>{t('form.sls.title')}</div>
        <Form.Item label={t('form.sls.endpoint')} name={[...names, 'sls.endpoint']} rules={[{ required: true }]}>
          <Input placeholder='http://localhost:9090' />
        </Form.Item>
      </div>
      <div className='page-title'>{t('form.sls.access')}</div>
      <Row gutter={16}>
        <Col flex={'1'}>
          <Form.Item label='AccessKey ID' name={[...names, 'sls.access_key_id']} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col flex={'1'}>
          <Form.Item label='AccessKey Secret' name={[...names, 'sls.access_key_secret']} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col>
          <div style={{ width: '30px' }}></div>
        </Col>
      </Row>
      <Form.Item label={t('form.cluster')} name='cluster_name'>
        <Select ref={clusterRef}>
          {_.map(clusters, (item) => {
            return (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            );
          })}
        </Select>
      </Form.Item>
      <Description />
      <div className='mt16'>
        <Footer id={data?.id} submitLoading={submitLoading} />
      </div>
    </Form>
  );
}
