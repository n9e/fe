import React from 'react';
import { Form } from 'antd';
import Queries from './Queries';
import Triggers from '@/pages/alertRules/Form/components/Triggers';

export default function IotDBAlertRule({ datasourceValue }) {
  const form = Form.useFormInstance();
  return (
    <>
      <div style={{ marginBottom: 10 }}>
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
