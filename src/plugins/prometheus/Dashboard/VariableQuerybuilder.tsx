import React from 'react';
import { Form, Input, Space } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

export default function VariableQuerybuilder() {
  const { t } = useTranslation('dashboard');

  return (
    <Form.Item
      label={
        <Space>
          {t('var.definition')}
          <QuestionCircleOutlined
            onClick={() => {
              window.open('https://flashcat.cloud/media/?type=夜莺监控&source=aHR0cHM6Ly9kb3dubG9hZC5mbGFzaGNhdC5jbG91ZC9uOWUtMTMtZGFzaGJvYXJkLWludHJvLm1wNA==');
            }}
          />
        </Space>
      }
      name='definition'
      rules={[{ required: true, message: t('var.definition_msg1') }]}
      required
    >
      <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
    </Form.Item>
  );
}
