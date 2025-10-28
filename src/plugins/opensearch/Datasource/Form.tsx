import React, { useRef } from 'react';
import { Form, Card, Select, InputNumber, Tooltip, Row, Col } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { scrollToFirstError } from '@/utils';
import Name from '@/pages/datasource/components/items/Name';
import BasicAuth from '@/pages/datasource/components/itemsNG/BasicAuth';
import Headers from '@/pages/datasource/components/itemsNG/Headers';
import Description from '@/pages/datasource/components/items/Description';
import Footer from '@/pages/datasource/components/items/Footer';
import Cluster from '@/pages/datasource/components/itemsNG/Cluster';

import HTTPList from './HTTPList';

export default function FormCpt({ action, data, onFinish, submitLoading }: any) {
  const { t } = useTranslation('datasourceManage');
  const [form] = Form.useForm();
  const clusterRef = useRef<any>();
  const names = ['settings'];
  const versionList = [
    {
      lebel: '2.0+',
      value: '2.0+',
    },
  ];
  const cate = 'os';

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
        <HTTPList />
        <BasicAuth cate={cate} showTls />
        <Headers cate={cate} />
        <div className='page-title my-2'>{t('form.os.title')}</div>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label={t('form.es.version')} name={[...names, `os.version`]} rules={[]} initialValue='2.0+'>
              <Select options={versionList}></Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={t('form.es.max_shard')}
              name={[...names, 'os.max_shard']}
              rules={[
                {
                  type: 'number',
                  min: 0,
                },
              ]}
              initialValue={5}
            >
              <InputNumber
                style={{
                  width: '100%',
                }}
                controls={false}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={
                <>
                  <span>{t('form.es.min_interval')}</span>
                  <Tooltip title={t('form.es.min_interval_tip')}>
                    <InfoCircleOutlined className='ml-2' />
                  </Tooltip>
                </>
              }
              name={[...names, `os.min_interval`]}
              rules={[
                {
                  type: 'number',
                  min: 0,
                },
              ]}
              initialValue={10}
            >
              <InputNumber
                style={{
                  width: '100%',
                }}
                controls={false}
              />
            </Form.Item>
          </Col>
        </Row>
        <div className='page-title mt-2'>{t('form.other')}</div>
        <Cluster cate={cate} clusterRef={clusterRef} />
        <Description />
      </Card>
      <Footer id={data?.id} submitLoading={submitLoading} />
    </Form>
  );
}
