import React from 'react';
import { Form, Input, Select } from 'antd';
import _ from 'lodash';
import useFetchDatasourceList from './useFetchDatasourceList';

interface IProps {
  name?: string | string[];
  layout?: 'horizontal' | 'vertical';
  cate: string;
  defaultDatasourceValue?: number;
}

export default function ValueSelect(props: IProps) {
  const { name = 'datasourceValue', layout, cate, defaultDatasourceValue } = props;
  const { groupedDatasourceList } = useFetchDatasourceList();

  return (
    <Input.Group compact>
      {layout === 'horizontal' ? (
        <span
          className='ant-input-group-addon'
          style={{
            width: 'max-content',
            height: 32,
            lineHeight: '32px',
          }}
        >
          关联数据源
        </span>
      ) : null}

      <Form.Item
        name={name}
        label={layout === 'vertical'}
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
          placeholder={cate !== 'prometheus' ? '选择数据源' : _.find(groupedDatasourceList.prometheus, { id: defaultDatasourceValue })?.name}
          style={{ minWidth: 70 }}
          dropdownMatchSelectWidth={false}
        >
          {_.map(groupedDatasourceList[cate], (item) => (
            <Select.Option value={item.id} key={item.id}>
              {item.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </Input.Group>
  );
}
