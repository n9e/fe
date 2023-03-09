import React from 'react';
import { Form, Input, Select } from 'antd';
import { SelectValue } from 'antd/lib/select';
import _ from 'lodash';
import { getAuthorizedDatasourceCates } from '@/components/AdvancedWrap';

interface IProps {
  name?: string | string[];
  layout?: 'horizontal' | 'vertical';
  defaultValue?: string;
  onChange?: (val: SelectValue) => void;
}

export default function CateSelect(props: IProps) {
  const { name = 'datasourceCate', layout, defaultValue, onChange } = props;
  const cates = getAuthorizedDatasourceCates();
  return (
    <Input.Group>
      {layout === 'horizontal' ? <span className='ant-input-group-addon'>数据源类型</span> : null}
      <Form.Item label={layout === 'vertical'} name={name} noStyle initialValue={defaultValue}>
        <Select
          dropdownMatchSelectWidth={false}
          style={{ minWidth: 70 }}
          onChange={(val) => {
            if (onChange) onChange(val);
          }}
        >
          {_.map(cates, (item) => (
            <Select.Option key={item.value} value={item.value}>
              {item.label}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </Input.Group>
  );
}
