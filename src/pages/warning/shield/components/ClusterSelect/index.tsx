import React, { useState, useEffect } from 'react';
import { Form, Select } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import { getDatasourceList } from '@/services/common';
export const ClusterAll = '$all';

export default function index({ form, cate }) {
  const [datasourceList, setDatasourceList] = useState<{ name: string; id: number }[]>([]);
  const handleClusterChange = (v: string[]) => {
    if (v.includes(ClusterAll)) {
      form.setFieldsValue({ cluster: [ClusterAll] });
    }
  };

  useEffect(() => {
    getDatasourceList([cate])
      .then((res) => {
        setDatasourceList(res);
      })
      .catch(() => {
        setDatasourceList([]);
      });
  }, [cate]);

  return (
    <Form.Item
      label='生效集群'
      name='cluster'
      rules={[
        {
          required: true,
          message: '生效集群不能为空',
        },
      ]}
    >
      <Select suffixIcon={<CaretDownOutlined />} mode='multiple' onChange={handleClusterChange}>
        <Select.Option value={ClusterAll} key={ClusterAll}>
          {ClusterAll}
        </Select.Option>
        {datasourceList?.map((item) => (
          <Select.Option value={item.name} key={item.id}>
            {item.name}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
}
