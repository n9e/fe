import React, { useContext } from 'react';
import { Form, Input, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import DocumentDrawer from '@/components/DocumentDrawer';

import { NAME_SPACE } from '../constants';

export default function VariableQuerybuilder() {
  const { t, i18n } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);

  return (
    <Form.Item
      label={
        <Space>
          {t('query.variable_sql')}
          <a
            onClick={() => {
              DocumentDrawer({
                language: i18n.language === 'zh_CN' ? 'zh_CN' : 'en_US',
                darkMode,
                title: t('common:document_link'),
                type: 'iframe',
                documentPath: 'https://flashcat.cloud/docs/content/flashcat/log/discover/what-is-sql-mode-in-doris-discover/',
                anchor: '#2-时间宏',
              });
            }}
          >
            {t('query.variable_documentation')}
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
