import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Drawer, Table, Form, AutoComplete } from 'antd';
import { useTranslation } from 'react-i18next';
// @ts-ignore
import { getSLSProjectDetail, getSLSLogstore } from 'plus:/datasource/aliyunSLS/services';

export default function SlsForm({ dataSourceId }) {
  const { t } = useTranslation('datasourceManage');
  const [projectList, setProjectList] = useState<string[]>([]);
  const [logstoreList, setLogstoreList] = useState<string[]>([]);

  useEffect(() => {
    if (!dataSourceId) return;
    getSLSProjectDetail({ datasource_id: dataSourceId, cate: 'aliyun-sls' }).then((res) => {
      setProjectList(res.map((i) => i.projectName));
    });
  }, [dataSourceId]);

  const handleProjectChange = async (value: string) => {
    const res = await getSLSLogstore({ datasource_id: dataSourceId, cate: 'aliyun-sls', project: value });
    setLogstoreList(res);
  };

  return (
    <>
      <Form.Item label={t('auth.project')} name={['resource', 'sls_resource', 'project']} rules={[{ required: true, message: t('auth.placeholder') }]}>
        <AutoComplete
          options={projectList.map((i) => ({ label: i, value: i }))}
          onChange={handleProjectChange}
          filterOption={(input, option: any) => option.value && option.value.indexOf(input) >= 0}
        />
      </Form.Item>
      <Form.Item label={t('auth.logstore')} name={['resource', 'sls_resource', 'logstore']} rules={[{ required: true, message: t('auth.placeholder') }]}>
        <AutoComplete options={logstoreList.map((i) => ({ label: i, value: i }))} filterOption={(input, option: any) => option.value && option.value.indexOf(input) >= 0} />
      </Form.Item>
    </>
  );
}
