import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Space, Form, InputNumber } from 'antd';
import { RightOutlined, DownOutlined } from '@ant-design/icons';

export default function AdvancedSettings() {
  const { t } = useTranslation('alertRules');
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      <div>
        <Space
          onClick={() => {
            setCollapsed(!collapsed);
          }}
          style={{
            cursor: 'pointer',
          }}
        >
          {t('datasource:es.alert.advancedSettings')}
          {collapsed ? <DownOutlined /> : <RightOutlined />}
        </Space>
      </div>
      <div
        style={{
          display: collapsed ? 'block' : 'none',
        }}
      >
        <Form.Item
          name='delay'
          label={
            <Space>
              {t('datasource:es.alert.delay')}({t('common:time.second')})
            </Space>
          }
        >
          <InputNumber min={0} />
        </Form.Item>
      </div>
    </div>
  );
}
