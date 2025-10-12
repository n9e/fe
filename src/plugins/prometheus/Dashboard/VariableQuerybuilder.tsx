import React, { useContext } from 'react';
import { Form, Input, Space, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import DocumentDrawer from '@/components/DocumentDrawer';

export default function VariableQuerybuilder() {
  const { t, i18n } = useTranslation('dashboard');
  const { darkMode } = useContext(CommonStateContext);

  return (
    <Form.Item
      label={
        <Space size={4}>
          {t('var.definition')}
          <Tooltip title={t('common:click_to_view_doc')}>
            <QuestionCircleOutlined
              onClick={() => {
                DocumentDrawer({
                  language: i18n.language,
                  darkMode,
                  title: t('var.definition'),
                  documentPath: '/docs/dashboards/variables/query/prometheus',
                });
              }}
            />
          </Tooltip>
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
