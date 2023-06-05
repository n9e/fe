import React, { useRef } from 'react';
import { Form, Input } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import Name from '../../components/items/Name';
import HTTP from '../../components/items/HTTP';
import BasicAuth from '../../components/items/BasicAuth';
import SkipTLSVerify from '../../components/items/SkipTLSVerify';
import Headers from '../../components/items/Headers';
import Description from '../../components/items/Description';
import Footer from '../../components/items/Footer';
import Cluster from '../../components/items/Cluster';

export default function FormCpt({ data, onFinish, submitLoading }: any) {
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
      initialValues={data}
      className='settings-source-form'
    >
      <Name />
      <HTTP
        urlExtra={
          <>
            <div
              className='second-color'
              style={{
                paddingLeft: '12px',
                margin: '0 0 18px',
              }}
            >
              <div>{t('form.prom.url_tip')}</div>
              <div>{'1. Prometheus:  http://localhost:9090/'}</div>
              <div>{'2. Thanos:  http://localhost:19192/'}</div>
              <div>{'3. VictoriaMetrics:  http://{vmselect}:8481/select/0/prometheus/'}</div>
              <div>{'4. M3:  http://localhost:7201/'}</div>
              <div>{'5. SLS:  https://{project}.{sls-enpoint}/prometheus/{project}/{metricstore}/'}</div>
            </div>
          </>
        }
      />
      <BasicAuth />
      <SkipTLSVerify />
      <Headers />
      <div className='page-title' style={{ marginTop: 0 }}>
        {t('form.other')}
      </div>
      <Form.Item label='remote write' tooltip={t('form.prom.write_addr_tip')} name={['settings', 'write_addr']}>
        <Input />
      </Form.Item>
      <Cluster form={form} clusterRef={clusterRef} />
      <Description />
      <div className='mt16'>
        <Footer id={data?.id} submitLoading={submitLoading} />
      </div>
    </Form>
  );
}
