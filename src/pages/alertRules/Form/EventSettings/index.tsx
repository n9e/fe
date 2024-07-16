import React, { useContext } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Space, Card } from 'antd';
import { RightOutlined, DownOutlined } from '@ant-design/icons';
import { panelBaseProps } from '@/pages/alertRules/constants';
import DocumentDrawer from '@/components/DocumentDrawer';
import { CommonStateContext } from '@/App';
import Relabel from './Relabel';
import { name } from './Relabel';

export default function index({ initialValues }) {
  const { t, i18n } = useTranslation('alertRules');
  const { darkMode } = useContext(CommonStateContext);
  const [collapsed, setCollapsed] = React.useState(_.isEmpty(_.get(initialValues, name)));

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
          {!collapsed && (
            <a
              onClick={(event) => {
                event.stopPropagation();
                DocumentDrawer({
                  language: i18n.language,
                  darkMode,
                  title: t('relabel.help_btn'),
                  documentPath: '/docs/alert-event-relabel',
                });
              }}
            >
              {t('relabel.help_btn')}
            </a>
          )}
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
