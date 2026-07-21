import React from 'react';
import { Form } from 'antd';
import Queries from './Queries';
import Triggers from '@/pages/alertRules/FormNG/components/Triggers';

export default function IotDBAlertRule({ datasourceValue }) {
  const form = Form.useFormInstance();
  return (
    <>
      <div className='mb-4'>
        <Queries form={form} prefixName={['rule_config']} datasourceValue={datasourceValue} />
      </div>
      <Form.Item shouldUpdate noStyle>
        {({ getFieldValue }) => {
          const queries = getFieldValue(['rule_config', 'queries']);
          return <Triggers prefixName={['rule_config']} queries={queries} />;
        }}
      </Form.Item>
    </>
  );
}
