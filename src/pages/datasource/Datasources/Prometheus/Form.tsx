import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Select } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import Name from '../../components/items/Name';
import HTTP from '../../components/items/HTTP';
import BasicAuth from '../../components/items/BasicAuth';
import SkipTLSVerify from '../../components/items/SkipTLSVerify';
import Headers from '../../components/items/Headers';
import Description from '../../components/items/Description';
import Footer from '../../components/items/Footer';
import { getServerClusters } from '../../services';

export default function FormCpt({ data, onFinish, submitLoading }: any) {
  const { t } = useTranslation('datasourceManage');
  const [form] = Form.useForm();
  const [clusters, setClusters] = useState<any[]>([]);
  const clusterRef = useRef<any>();

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
      <HTTP />
      <BasicAuth />
      <SkipTLSVerify />
      <Headers />
      <div className='page-title' style={{ marginTop: 0 }}>
        {t('form.other')}
      </div>
      <Form.Item label='write_addr' name={['settings', 'write_addr']}>
        <Input />
      </Form.Item>
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
