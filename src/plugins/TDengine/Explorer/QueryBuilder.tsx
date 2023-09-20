import React from 'react';
import _ from 'lodash';
import { Input, Form } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import TimeRangePicker from '@/components/TimeRangePicker';
import SqlTemplates from '../components/SqlTemplates';

interface Props {
  form: FormInstance;
  extra?: React.ReactNode;
  setRefreshFlag: (flag?: string) => void;
}

export default function QueryBuilder(props: Props) {
  const { form, extra, setRefreshFlag } = props;

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
        <SqlTemplates
          onSelect={(sql) => {
            form.setFieldsValue({
              query: _.set(form.getFieldValue(['query']), 'query', sql),
            });
          }}
        />
        {extra}
      </div>
    </div>
  );
}
