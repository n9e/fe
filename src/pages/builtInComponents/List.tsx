import React, { useContext, useEffect, useState } from 'react';
import _ from 'lodash';
import queryString from 'query-string';
import { Input, Drawer, Space, Tabs, Button, Modal } from 'antd';
import { SafetyCertificateOutlined, SearchOutlined, CloseOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { CommonStateContext } from '@/App';
import PageLayout from '@/components/pageLayout';
import Instructions from './Instructions';
import AlertRules from './AlertRules';
import CollectTpls from './CollectTpls';
import Metrics from './Metrics';
import Dashboards from './Dashboards';
import { getComponents, Component, deleteComponents, putComponent } from './services';
import ComponentFormModal from './components/ComponentFormModal';

const BUILT_IN_ACTIVE_TAB_KEY = 'builtin-drawer-active-tab';

export default function index() {
  const { darkMode } = useContext(CommonStateContext);
  const { t } = useTranslation('builtInComponents');
  const { search } = useLocation();
  const query = queryString.parse(search);
  const [searchValue, setSearchValue] = useState('');
  const [data, setData] = useState<Component[]>([]);
  const [activeComponent, setActiveComponent] = useState<Component>();
  const [readme, setReadme] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(localStorage.getItem(BUILT_IN_ACTIVE_TAB_KEY) || 'tab_instructions');
  const [readmeEditabled, setReadmeEditabled] = useState(false);
  const defaultComponent = query.component as string;
  const currentComponent = defaultComponent || activeComponent?.ident;
  const fetchData = () => {
    getComponents().then((res) => {
      setData(res);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <PageLayout title={t('title')} icon={<SafetyCertificateOutlined />}>
      <div>
        <div style={{ background: 'unset' }}>
          <div className='mb2' style={{ display: 'flex', justifyContent: 'space-between' }}>
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
            <Button
              type='primary'
              onClick={() => {
                ComponentFormModal({
                  darkMode,
                  components: data,
                  action: 'create',
                  onOk: () => {
                    fetchData();
                  },
                });
              }}
            >
              {t('common:btn.create')}
            </Button>
          </div>
          <div className='builtin-cates-grid'>
            {_.map(
              _.filter(data, (item) => {
                return _.includes(_.toUpper(item.ident), _.toUpper(searchValue));
              }),
              (item) => {
                return (
                  <div
                    key={item.ident}
                    className='builtin-cates-grid-item'
                    onClick={() => {
                      setActiveComponent(item);
                      setReadme(item.readme);
                      setDrawerOpen(true);
                    }}
                  >
                    <img src={item.logo} style={{ height: 42, maxWidth: '60%' }} />
                    <div>{item.ident}</div>
                    <div className='builtin-cates-grid-item-operations'>
                      <Space size={0}>
                        <Button
                          size='small'
                          type='link'
                          className='p0'
                          onClick={(e) => {
                            e.stopPropagation();
                            ComponentFormModal({
                              darkMode,
                              components: data,
                              action: 'edit',
                              initialValues: item,
                              onOk: () => {
                                fetchData();
                              },
                            });
                          }}
                          icon={<EditOutlined />}
                        />
                        <Button
                          size='small'
                          type='link'
                          danger
                          className='p0'
                          icon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            Modal.confirm({
                              title: t('common:confirm.delete'),
                              onOk: () => {
                                deleteComponents([item.id]).then(() => {
                                  fetchData();
                                });
                              },
                            });
                          }}
                        />
                      </Space>
                    </div>
                  </div>
                );
              },
            )}
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
            <img src={activeComponent?.logo} style={{ height: 24, width: 24 }} />
            <div>{activeComponent?.ident}</div>
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
          setReadmeEditabled(false);
          setReadme(activeComponent?.readme || '');
        }}
        footer={
          activeTab === 'tab_instructions' &&
          (readmeEditabled ? (
            <Space>
              <Button
                type='primary'
                onClick={() => {
                  if (activeComponent) {
                    putComponent({ ...activeComponent, readme }).then(() => {
                      fetchData();
                    });
                    setReadmeEditabled(!readmeEditabled);
                  }
                }}
              >
                {t('common:btn.save')}
              </Button>
              <Button
                onClick={() => {
                  setReadmeEditabled(!readmeEditabled);
                  setReadme(activeComponent?.readme || '');
                }}
              >
                {t('common:btn.cancel')}
              </Button>
            </Space>
          ) : (
            <Button
              type='primary'
              onClick={() => {
                setReadmeEditabled(!readmeEditabled);
              }}
            >
              {t('common:btn.edit')}
            </Button>
          ))
        }
      >
        {currentComponent && (
          <Tabs
            className='builtin-drawer-tabs'
            activeKey={activeTab}
            onChange={(activeKey) => {
              setActiveTab(activeKey);
              localStorage.setItem(BUILT_IN_ACTIVE_TAB_KEY, activeKey);
            }}
          >
            <Tabs.TabPane tab={t('tab_instructions')} key='tab_instructions' className='builtin-drawer-tab-pane'>
              <Instructions
                value={readme}
                onChange={(newValue) => {
                  setReadme(newValue);
                }}
                editabled={readmeEditabled}
                setReadmeEditabled={setReadmeEditabled}
              />
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
