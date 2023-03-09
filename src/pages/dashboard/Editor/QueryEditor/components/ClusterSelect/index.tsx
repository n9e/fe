import React, { useState, useEffect } from 'react';
import { Form, Select } from 'antd';
import _ from 'lodash';
import { getDatasourceList } from '@/services/common';

interface IProps {
  cate: string;
  defaultDatasourceValue?: number; // 只是给 prometheus 用的
  name?: string | string[];
  label?: React.ReactNode;
}

export default function index(props: IProps) {
  const { cate, defaultDatasourceValue, name = 'datasourceValue', label } = props;
  const [datasourceList, setDatasourceList] = useState<{ name: string; id: number }[]>([]);

  useEffect(() => {
    getDatasourceList([cate]).then((res) => {
      setDatasourceList(res);
    });
  }, [cate]);

  return (
    <Form.Item
      label={label}
      name={name}
      tooltip='Prometheus 数据源默认关联全局的数据源值'
      rules={[
        {
          required: cate !== 'prometheus',
          message: '请选择数据源',
        },
      ]}
    >
      <Select
        allowClear
        placeholder={cate !== 'prometheus' ? '选择数据源' : _.find(datasourceList, { id: defaultDatasourceValue })?.name}
        style={{ minWidth: 70 }}
        dropdownMatchSelectWidth={false}
      >
        {datasourceList?.map((item) => (
          <Select.Option value={item.id} key={item.id}>
            {item.name}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
}
