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
import IBEX from './IBEX';
import './style.less';
import './locale';

export default function index() {
  const { t } = useTranslation('notificationSettings');
  const { search } = useLocation();
  const query = queryString.parse(search);
  const history = useHistory();
  const [activeKey, setActiveKey] = React.useState((query.tab as string) || 'webhooks');

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
            <Tabs.TabPane tab={t('webhooks.title')} key='webhooks'>
              <Webhooks />
            </Tabs.TabPane>
            <Tabs.TabPane tab={t('script.title')} key='script'>
              <Script />
            </Tabs.TabPane>
            <Tabs.TabPane tab={t('channels.title')} key='channels'>
              <Channels />
            </Tabs.TabPane>
            <Tabs.TabPane tab={t('contacts.title')} key='contacts'>
              <Contacts />
            </Tabs.TabPane>
            <Tabs.TabPane tab={t('smtp.title')} key='smtp'>
              <SMTP />
            </Tabs.TabPane>
            <Tabs.TabPane tab={t('ibex.title')} key='ibex'>
              <IBEX />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
}
