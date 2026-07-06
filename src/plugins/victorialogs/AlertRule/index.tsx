import React from 'react';
import _ from 'lodash';
import { Form } from 'antd';

import Triggers from '@/pages/alertRules/FormNG/components/Triggers';

import Queries from './Queries';

export default function index({ datasourceValue }) {
  return (
    <>
      <div className='mb-4'>
        <Queries prefixName={['rule_config']} datasourceValue={datasourceValue} />
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
