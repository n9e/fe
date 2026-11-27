import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Form, Select } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { getServerClusters } from '../../services';

export default function Cluster({ form, clusterRef, requireValidCluster }: { form: any; clusterRef?: any; requireValidCluster?: boolean }) {
  const { t } = useTranslation('datasourceManage');
  const [clusters, setClusters] = useState<string[]>([]);
  const clustersRef = useRef<string[]>([]);
  const autoFilledClusterRef = useRef<string | undefined>();
  const requireValidClusterRef = useRef<boolean | undefined>(requireValidCluster);
  requireValidClusterRef.current = requireValidCluster;
  const prevRequireValidRef = useRef<boolean | undefined>(requireValidCluster);
  const updateClusters = useCallback((list: string[]) => {
    clustersRef.current = list;
    setClusters(list);
  }, []);

  useEffect(() => {
    getServerClusters()
      .then((res) => {
        const availableClusters = res ?? [];
        updateClusters(availableClusters);
        // 新增的时候，自动填充第一个集群；若当前已开启经 edge 查询，则保持未选状态由用户显式指定
        const defaultCluster = availableClusters[0];
        if (defaultCluster !== undefined && form.getFieldValue('cluster_name') === undefined && !requireValidClusterRef.current) {
          autoFilledClusterRef.current = defaultCluster;
          form.setFieldsValue({ cluster_name: defaultCluster });
        }
        form.validateFields(['cluster_name']).catch(() => undefined);
      })
      .catch(() => undefined);
  }, [form, updateClusters]);

  useEffect(() => {
    const prev = prevRequireValidRef.current;
    prevRequireValidRef.current = requireValidCluster;
    if (prev === requireValidCluster) {
      return;
    }
    const autoFilledCluster = autoFilledClusterRef.current;
    const currentCluster = form.getFieldValue('cluster_name');
    if (autoFilledCluster !== undefined) {
      if (requireValidCluster && currentCluster === autoFilledCluster) {
        form.setFieldsValue({ cluster_name: undefined });
      } else if (!requireValidCluster && currentCluster === undefined) {
        form.setFieldsValue({ cluster_name: autoFilledCluster });
      }
    }
    form.validateFields(['cluster_name']).catch(() => undefined);
  }, [form, requireValidCluster]);

  const options = requireValidCluster ? clusters : _.concat(clusters, 'no_assigned_engine');

  return (
    <Form.Item
      label={t('form.cluster')}
      name='cluster_name'
      tooltip={t('form.cluster_tip')}
      required={requireValidCluster}
      rules={[
        {
          validator: (_field, value) => {
            if (requireValidCluster && (!value || value === 'no_assigned_engine')) {
              return Promise.reject(t('form.edge_cluster_required'));
            }
            const invalidCluster = !clustersRef.current.includes(value) && value !== 'no_assigned_engine';
            if (invalidCluster) {
              return Promise.reject(t('form.cluster_not_found'));
            }
            return Promise.resolve();
          },
        },
      ]}
    >
      <Select
        ref={clusterRef}
        allowClear={!requireValidCluster}
        onSelect={() => {
          autoFilledClusterRef.current = undefined;
        }}
        onClear={() => {
          autoFilledClusterRef.current = undefined;
        }}
      >
        {_.map(options, (item) => {
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
