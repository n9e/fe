import React, { useContext } from 'react';
import { Form, Input, Space, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import DocumentDrawer from '@/components/DocumentDrawer';
import { DORIS_SQL_MODE_DOC_URL, NAME_SPACE } from '../constants';

export default function VariableQuerybuilder() {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);

  return (
    <Form.Item
      label={
        <Space>
          SQL
          <Tooltip title={t('query.variable_format_tip')}>
            <InfoCircleOutlined />
          </Tooltip>
          <a
            onClick={() => {
              DocumentDrawer({
                language: i18n.language === 'zh_CN' ? 'zh_CN' : 'en_US',
                darkMode,
                title: t('common:document_link'),
                type: 'iframe',
                documentPath: DORIS_SQL_MODE_DOC_URL,
                anchor: '#2-时间宏',
              });
            }}
          >
            {t('common:document_link')}
          </a>
        </Space>
      }
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
