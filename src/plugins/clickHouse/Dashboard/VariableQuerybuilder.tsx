import React from 'react';
import { Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { NAME_SPACE } from '../constants';

export default function VariableQuerybuilder() {
  const { t } = useTranslation(NAME_SPACE);

  return (
    <Form.Item
      label={t('var.query')}
      name={['query', 'query']}
      rules={[
        {
          required: true,
        },
      ]}
    >
      <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
    </Form.Item>
  );
}
