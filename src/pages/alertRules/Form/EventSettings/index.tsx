import React from 'react';
import { useTranslation } from 'react-i18next';
import { Space, Card } from 'antd';
import { RightOutlined, DownOutlined } from '@ant-design/icons';
import { panelBaseProps } from '@/pages/alertRules/constants';
import Relabel from './Relabel';

export default function index() {
  const { t } = useTranslation('alertRules');
  const [collapsed, setCollapsed] = React.useState(true);

  return (
    <Card
      {...panelBaseProps}
      title={
        <Space
          style={{
            cursor: 'pointer',
          }}
          onClick={() => {
            setCollapsed(!collapsed);
          }}
        >
          {t('relabel.title')}
          {collapsed ? <RightOutlined /> : <DownOutlined />}
        </Space>
      }
      bodyStyle={{
        display: collapsed ? 'none' : 'block',
      }}
    >
      <div
        style={{
          display: collapsed ? 'none' : 'block',
        }}
      >
        <Relabel />
      </div>
    </Card>
  );
}
