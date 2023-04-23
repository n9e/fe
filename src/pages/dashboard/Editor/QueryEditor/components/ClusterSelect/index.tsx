import React, { useState, useEffect } from 'react';
import { Form, Select } from 'antd';
import _ from 'lodash';
import { getDatasourceList } from '@/services/common';

interface IProps {
  cate: string;
  name?: string | string[];
  label?: React.ReactNode;
  datasourceVars?: any[];
}

export default function index(props: IProps) {
  const { cate, name = 'datasourceValue', label, datasourceVars } = props;
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
          required: true,
          message: '请选择数据源',
        },
      ]}
    >
      <Select allowClear placeholder='选择数据源' style={{ minWidth: 70 }} dropdownMatchSelectWidth={false}>
        {_.map(datasourceVars, (item, idx) => {
          return (
            <Select.Option value={`\${${item.name}}`} key={`${item.name}_${idx}`}>
              {`\${${item.name}}`}
            </Select.Option>
          );
        })}
        {datasourceList?.map((item) => (
          <Select.Option value={item.id} key={item.id}>
            {item.name}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
}
