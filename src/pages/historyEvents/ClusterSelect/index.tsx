import React, { useState, useEffect } from 'react';
import { Select } from 'antd';
import { CaretDownOutlined } from '@ant-design/icons';
import { getDatasourceList } from '@/services/common';

export default function index({ cate, onClusterChange }) {
  const [datasourceList, setDatasourceList] = useState<{ name: string; id: number }[]>([]);

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
    <Select
      suffixIcon={<CaretDownOutlined />}
      mode='multiple'
      onChange={onClusterChange}
      placeholder='集群'
      style={{ minWidth: 80, marginLeft: 8 }}
      dropdownMatchSelectWidth={false}
    >
      {datasourceList?.map((item) => (
        <Select.Option value={item.name} key={item.id}>
          {item.name}
        </Select.Option>
      ))}
    </Select>
  );
}
