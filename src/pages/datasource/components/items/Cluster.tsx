import React, { useEffect, useState } from 'react';
import { Form, Select } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { getServerClusters } from '../../services';

export default function Cluster({ form, clusterRef }) {
  const { t } = useTranslation('datasourceManage');
  const [clusters, setClusters] = useState<string[]>([]);

  useEffect(() => {
    getServerClusters().then((res) => {
      setClusters(res);
      // 新增的时候，自动填充第一个集群
      const values = form.getFieldsValue();
      if (values?.cluster_name === undefined) {
        form.setFieldsValue({ cluster_name: res?.[0] });
      }
      form.validateFields(['cluster_name']);
    });
  }, []);

  return (
    <Form.Item
      label={t('form.cluster')}
      name='cluster_name'
      tooltip={t('form.cluster_tip')}
      rules={[
        {
          validator: (_field, value) => {
            const invalidCluster = !_.find(clusters, (item) => item === value) && value !== 'no_assigned_engine';
            if (invalidCluster) {
              return Promise.reject(t('form.cluster_not_found'));
            }
            return Promise.resolve();
          },
        },
      ]}
    >
      <Select ref={clusterRef} allowClear>
        {_.map(_.concat(clusters, 'no_assigned_engine'), (item) => {
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
