import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs } from 'antd';
import { useLocation, useHistory } from 'react-router-dom';
import queryString from 'query-string';
import PageLayout from '@/components/pageLayout';
import Webhooks from './Webhooks';
import Script from './Script';
import Channels from './Channels';
import Contacts from './Contacts';
import SMTP from './SMTP';
// @ts-ignore
import { notificationSettings as plusNotificationSettings } from 'plus:/parcels/NotificationSettings';
import './style.less';
import './locale';

export default function index() {
  const { t } = useTranslation('notificationSettings');
  const { search } = useLocation();
  const query = queryString.parse(search);
  const history = useHistory();
  const [activeKey, setActiveKey] = React.useState((query.tab as string) || 'webhooks');
  const panes = [
    {
      key: 'webhooks',
      content: <Webhooks />,
    },
    {
      key: 'script',
      content: <Script />,
    },
    {
      key: 'channels',
      content: <Channels />,
    },
    {
      key: 'contacts',
      content: <Contacts />,
    },
    {
      key: 'smtp',
      content: <SMTP />,
    },
    ...(plusNotificationSettings || []),
  ];

  return (
    <PageLayout title={t('title')}>
      <div>
        <div
          style={{
            padding: '0 10px 10px 10px',
          }}
        >
          <Tabs
            activeKey={activeKey}
            onChange={(val) => {
              setActiveKey(val);
              history.push({
                pathname: location.pathname,
                search: `?tab=${val}`,
              });
            }}
          >
            {panes.map((pane) => {
              return (
                <Tabs.TabPane tab={t(`${pane.key}.title`)} key={pane.key}>
                  {pane.content}
                </Tabs.TabPane>
              );
            })}
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
}
