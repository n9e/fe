import React from 'react';
import { Input, Form, Dropdown, Button, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import TimeRangePicker from '@/components/TimeRangePicker';

interface Props {
  extra?: React.ReactNode;
}

export default function QueryBuilder(props: Props) {
  const { extra } = props;

  return (
    <div style={{ width: '100%' }}>
      <div className='tdengine-discover-query'>
        <InputGroupWithFormItem label='查询条件'>
          <Form.Item name={['query', 'query']}>
            <Input />
          </Form.Item>
        </InputGroupWithFormItem>
        <Form.Item name={['query', 'range']} initialValue={{ start: 'now-1h', end: 'now' }}>
          <TimeRangePicker />
        </Form.Item>
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item>模板一</Menu.Item>
              <Menu.Item>模板二</Menu.Item>
            </Menu>
          }
        >
          <Button>
            查询模板 <DownOutlined />
          </Button>
        </Dropdown>
        {extra}
      </div>
    </div>
  );
}
