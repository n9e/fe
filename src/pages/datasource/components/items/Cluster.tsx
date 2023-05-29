import React, { useEffect, useState } from 'react';
import { Form, Select } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { getServerClusters } from '../../services';

export default function Cluster({ form, clusterRef }) {
  const { t } = useTranslation('datasourceManage');
  const [clusters, setClusters] = useState<any[]>([]);

  useEffect(() => {
    getServerClusters().then((res) => {
      setClusters(res);
      form.setFieldsValue({ cluster_name: res?.[0] });
    });
  }, []);
  return (
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
  );
}
