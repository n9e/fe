import React from 'react';
import { Form, Select, Row, Col, Card } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { scrollToFirstError } from '@/utils';
import Name from '../../components/items/Name';
import HTTP from '../../components/items/HTTP';
import BasicAuth from '../../components/items/BasicAuth';
import SkipTLSVerify from '../../components/items/SkipTLSVerify';
import Headers from '../../components/items/Headers';
import Description from '../../components/items/Description';
import Footer from '../../components/items/Footer';

export default function FormCpt({ action, data, onFinish, submitLoading }: any) {
  const { t } = useTranslation('datasourceManage');
  const [form] = Form.useForm();

  return (
    <Form
      form={form}
      layout='vertical'
      onFinish={onFinish}
      onFinishFailed={() => {
        scrollToFirstError();
      }}
      initialValues={data}
      className='settings-source-form'
    >
      <Card title={t(`${action}_title`)}>
        <Name />
        <HTTP placeholder='http://localhost:16686' />
        <BasicAuth />
        <SkipTLSVerify />
        <Headers />
        <div className='page-title' style={{ marginTop: 0 }}>
          {t('form.other')}
        </div>
        <Row gutter={8}>
          <Col span={24}>
            <Form.Item label={t('form.jaeger.version')} name={['settings', 'version']} rules={[]} initialValue='v3'>
              <Select options={[{ lebel: 'v3', value: 'v3' }]}></Select>
            </Form.Item>
          </Col>
        </Row>
        <Description />
      </Card>
      <Footer id={data?.id} submitLoading={submitLoading} />
    </Form>
  );
}
