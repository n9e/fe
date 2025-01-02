import React from 'react';
import _ from 'lodash';
import { Form } from 'antd';
import Queries from './Queries';
import Triggers from '@/pages/alertRules/Form/components/Triggers';

export default function index({ form, datasourceValue, disabled }) {
  return (
    <>
      <div style={{ marginBottom: 10 }}>
        <Queries datasourceValue={datasourceValue} form={form} disabled={disabled} />
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
