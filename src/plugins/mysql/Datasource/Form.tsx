import React, { useRef } from 'react';
import { Form, Card } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { scrollToFirstError } from '@/utils';
import { IS_PRO } from '@/utils/constant';
import Name from '@/pages/datasource/components/items/Name';
import Description from '@/pages/datasource/components/items/Description';
import Footer from '@/pages/datasource/components/items/Footer';
import Cluster from '@/pages/datasource/components/items/Cluster';
import EdgeQuerySwitch from '@/pages/datasource/components/items/EdgeQuerySwitch';

import Conn from './components/Conn';
import './style.less';

export default function FormCpt({ action, data, onFinish, submitLoading }: any) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const clusterRef = useRef<any>();
  const useEdgeValue = Form.useWatch(['settings', 'use_edge'], form);
  const useEdge = IS_PRO && useEdgeValue === true;

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
      initialValues={IS_PRO ? { ...data, settings: { ...data?.settings, use_edge: data?.settings?.use_edge ?? false } } : data}
      className='settings-source-form'
    >
      <Card title={t(`datasourceManage:${action}_title`)}>
        <Name />
        <Conn type='mysql' />
        <div className='page-title' style={{ marginTop: 0 }}>
          {t('datasourceManage:form.other')}
        </div>
        <EdgeQuerySwitch form={form} />
        <Cluster form={form} clusterRef={clusterRef} requireValidCluster={useEdge} />
        <Description />
      </Card>
      <Footer id={data?.id} submitLoading={submitLoading} disableTestAndSave={useEdge} />
    </Form>
  );
}
