import React, { useRef } from 'react';
import { Form, Card, Input, InputNumber, Space, Switch, Row, Col } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { DatasourceCateEnum, SIZE } from '@/utils/constant';
import { scrollToFirstError } from '@/utils';
import Name from '@/pages/datasource/components/items/Name';
import Description from '@/pages/datasource/components/items/Description';
import Footer from '@/pages/datasource/components/items/Footer';
import BasicAuth from '@/pages/datasource/components/itemsNG/BasicAuth';
import Headers from '@/pages/datasource/components/itemsNG/Headers';
import Cluster from '@/pages/datasource/components/itemsNG/Cluster';

export default function FormCpt({ action, data, onFinish, submitLoading }: any) {
  const { t } = useTranslation('datasourceManage');
  const [form] = Form.useForm();
  const clusterRef = useRef<any>();
  const cate = DatasourceCateEnum.victorialogs;

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
        <Form.Item label='HTTP' name={['settings', `${cate}.addr`]}>
          <Input autoComplete='off' placeholder='http://localhost:9428/' />
        </Form.Item>
        <Row gutter={SIZE * 2}>
          <Col span={12}>
            <Form.Item label={t('form.timeout')} name={['settings', `${cate}.timeout`]} initialValue={10000}>
              <InputNumber controls={false} min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('form.logs_max_query_rows')} name={['settings', `${cate}.max_query_rows`]} initialValue={500}>
              <InputNumber controls={false} min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <BasicAuth cate={cate} />
        <Space className='mb-2'>
          <span>{t('form.skip_tls_verify')}</span>
          <Form.Item name={['settings', `${cate}.tls`, `${cate}.tls.skip_tls_verify`]} valuePropName='checked' noStyle>
            <Switch size='small' />
          </Form.Item>
        </Space>
        <Headers cate={cate} />
        <div className='page-title' style={{ marginTop: 0 }}>
          {t('form.other')}
        </div>
        <Cluster cate={cate} clusterRef={clusterRef} />
        <Description />
      </Card>
      <Footer id={data?.id} submitLoading={submitLoading} />
    </Form>
  );
}
