import React, { useRef } from 'react';
import { Form, InputNumber, Input, Row, Col } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import Name from '../../components/items/Name';
import Description from '../../components/items/Description';
import Footer from '../../components/items/Footer';

export default function FormCpt({ data, onFinish, submitLoading }: any) {
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
      initialValues={data}
      className='settings-source-form'
    >
      <Name />
      <>
        <div className='page-title'>HTTP</div>
        <Form.Item label='URL' name={[...names, 'zabbix.addr']} rules={[{ required: true }]}>
          <Input placeholder='http://localhost:9090' />
        </Form.Item>
        <Form.Item label={t('form.timeout')} name={[...names, 'zabbix.timeout']} rules={[{ type: 'number', min: 0 }]} initialValue={10000}>
          <InputNumber style={{ width: '100%' }} controls={false} />
        </Form.Item>
      </>
      <>
        <div className='page-title'>{t('form.auth')}</div>
        <Row gutter={16}>
          <Col flex={'1'}>
            <Form.Item label={t('form.username')} name={[...names, 'zabbix.user']}>
              <Input autoComplete='off' />
            </Form.Item>
          </Col>
          <Col flex={'1'}>
            <Form.Item label={t('form.password')} name={[...names, 'zabbix.password']}>
              <Input.Password autoComplete='new-password' />
            </Form.Item>
          </Col>
        </Row>
      </>
      <Description />
      <div className='mt16'>
        <Footer id={data?.id} submitLoading={submitLoading} />
      </div>
    </Form>
  );
}
