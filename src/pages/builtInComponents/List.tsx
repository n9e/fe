import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import queryString from 'query-string';
import { Input, Drawer, Space, Tabs } from 'antd';
import { SafetyCertificateOutlined, SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import PageLayout from '@/components/pageLayout';
import Instructions from './Instructions';
import AlertRules from './AlertRules';
import CollectTpls from './CollectTpls';
import Metrics from './Metrics';
import Dashboards from './Dashboards';
import { getComponents, Record } from './services';

export default function index() {
  const { t } = useTranslation('builtInComponents');
  const { search } = useLocation();
  const query = queryString.parse(search);
  const [searchValue, setSearchValue] = useState('');
  const [data, setData] = useState<Record[]>([]);
  const [active, setActive] = useState<Record>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const defaultComponent = query.component as string;
  const currentComponent = defaultComponent || active?.ident;

  useEffect(() => {
    getComponents().then((res) => {
      setData(res);
    });
  }, []);

  return (
    <PageLayout title={t('title')} icon={<SafetyCertificateOutlined />}>
      <div>
        <div style={{ background: 'unset' }}>
          <div className='mb2'>
            <Input
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
              }}
              allowClear
              placeholder={t('common:search_placeholder')}
            />
          </div>
          <div className='builtin-cates-grid'>
            {_.map(data, (item) => {
              return (
                <div
                  key={item.ident}
                  className='builtin-cates-grid-item'
                  onClick={() => {
                    setActive(item);
                    setDrawerOpen(true);
                  }}
                >
                  <img src={item.logo} style={{ height: 42, maxWidth: '60%' }} />
                  <div>{item.ident}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Drawer
        width={1000}
        visible={drawerOpen}
        closable={false}
        destroyOnClose
        title={
          <Space>
            <img src={active?.logo} style={{ height: 24, width: 24 }} />
            <div>{active?.ident}</div>
          </Space>
        }
        extra={
          <CloseOutlined
            onClick={() => {
              setDrawerOpen(false);
            }}
          />
        }
        onClose={() => {
          setDrawerOpen(false);
        }}
      >
        {currentComponent && (
          <Tabs>
            <Tabs.TabPane tab={t('tab_instructions')} key='tab_instructions'>
              <Instructions name={currentComponent} />
            </Tabs.TabPane>
            <Tabs.TabPane tab={t('tab_collectTpls')} key='tab_collectTpls'>
              <CollectTpls component={currentComponent} />
            </Tabs.TabPane>
            <Tabs.TabPane tab={t('tab_metrics')} key='tab_metrics'>
              <Metrics component={currentComponent} />
            </Tabs.TabPane>
            <Tabs.TabPane tab={t('tab_dashboards')} key='tab_dashboards'>
              <Dashboards component={currentComponent} />
            </Tabs.TabPane>
            <Tabs.TabPane tab={t('tab_alertRules')} key='tab_alertRules'>
              <AlertRules component={currentComponent} />
            </Tabs.TabPane>
          </Tabs>
        )}
      </Drawer>
    </PageLayout>
  );
}
