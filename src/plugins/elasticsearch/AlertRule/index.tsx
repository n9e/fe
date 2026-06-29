import React from 'react';
import _ from 'lodash';
import { Form } from 'antd';
import Queries from './Queries';
import Triggers from '@/pages/alertRules/FormNG/components/Triggers';

export default function index({ hideIndexPattern, datasourceValue, disabled }: { hideIndexPattern?: boolean; datasourceValue: number; disabled?: boolean }) {
  const form = Form.useFormInstance();
  return (
    <>
      <div className='mb-4'>
        <Queries hideIndexPattern={hideIndexPattern} datasourceValue={datasourceValue} form={form} disabled={disabled} />
      </div>
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const queries = getFieldValue(['rule_config', 'queries']);
          return <Triggers prefixName={['rule_config']} queries={queries} disabled={disabled} />;
        }}
      </Form.Item>
    </>
  );
}
