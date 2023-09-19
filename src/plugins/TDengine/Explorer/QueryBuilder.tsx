import React, { useEffect } from 'react';
import _ from 'lodash';
import { Input, Form, Dropdown, Button, Menu } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import { DownOutlined } from '@ant-design/icons';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import TimeRangePicker from '@/components/TimeRangePicker';
import { getSqlTemplate } from '../services';

interface Props {
  form: FormInstance;
  extra?: React.ReactNode;
  setRefreshFlag: (flag?: string) => void;
}

export default function QueryBuilder(props: Props) {
  const { form, extra, setRefreshFlag } = props;
  const [templates, setTemplates] = React.useState<{ [index: string]: string }>({
    getColumns: 'show columns from %s',
    getDatabases: 'show databases',
    getMetrics: 'select * from %s limit 1',
    getTables: 'show tables',
  });

  useEffect(() => {
    getSqlTemplate().then((res) => {
      setTemplates(res);
    });
  }, []);

  return (
    <div style={{ width: '100%' }}>
      <div className='tdengine-discover-query'>
        <InputGroupWithFormItem label='查询条件'>
          <Form.Item name={['query', 'query']}>
            <Input
              onBlur={() => {
                setRefreshFlag(_.uniqueId('refreshFlag_'));
              }}
            />
          </Form.Item>
        </InputGroupWithFormItem>
        <Form.Item name={['query', 'range']} initialValue={{ start: 'now-1h', end: 'now' }}>
          <TimeRangePicker />
        </Form.Item>
        <Dropdown
          overlay={
            <Menu>
              {_.map(templates, (val, key) => {
                return (
                  <Menu.Item
                    key={key}
                    onClick={() => {
                      form.setFieldsValue({
                        query: _.set(form.getFieldValue(['query']), 'query', val),
                      });
                    }}
                  >
                    {key}
                  </Menu.Item>
                );
              })}
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
