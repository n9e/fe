/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import _ from 'lodash';
import { useKeyPress } from 'ahooks';
import { Space, Empty, Spin, Dropdown, Input, Menu, notification, Tooltip } from 'antd';
import { SettingOutlined, DownOutlined, FullscreenOutlined } from '@ant-design/icons';
import { CommonStateContext } from '@/App';
import PageLayout from '@/components/pageLayout';
import AuthorizationWrapper from '@/components/AuthorizationWrapper';
import { getEmbeddedDashboards } from './services';
import { Record } from './types';
import FormModal from './FormModal';
import { adjustURL } from './utils';

const LOCAL_STORAGE_KEY = 'embeddedDashboards_id';

export default function index() {
  const { darkMode } = useContext(CommonStateContext);
  const { t } = useTranslation('embeddedDashboards');
  const history = useHistory();
  const location = useLocation();
  const query = queryString.parse(location.search);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<Record[]>();
  const [activeRecord, setActiveRecord] = useState<Record>();
  const [dashboardListDropdownSearch, setDashboardListDropdownSearch] = useState('');
  const [dashboardListDropdownVisible, setDashboardListDropdownVisible] = useState(false);
  const isClickTrigger = useRef(false);

  useEffect(() => {
    if (query.id) {
      const record = _.find(data, (item) => item.id === query.id);
      if (record) {
        setActiveRecord(record);
      } else {
        if (data && !_.isEmpty(data)) {
          const headRecord = data[0];
          let id = headRecord.id;
          if (_.find(data, (item) => item.id === localStorage.getItem(LOCAL_STORAGE_KEY))) {
            id = localStorage.getItem(LOCAL_STORAGE_KEY) as string;
          }
          history.replace({
            pathname: '/embedded-dashboards',
            search: queryString.stringify({
              ...query,
              id,
            }),
          });
        } else {
          setActiveRecord(undefined);
        }
      }
    }
  }, [data, query.id]);

  // useKeyPress('esc', () => {
  //   if (query.viewMode === 'fullscreen') {
  //     history.replace({
  //       pathname: location.pathname,
  //       search: queryString.stringify(_.omit(query, ['viewMode'])),
  //     });
  //     notification.close('dashboard_fullscreen');
  //   }
  // });

  // useEffect(() => {
  //   if (query.viewMode === 'fullscreen' && isClickTrigger.current) {
  //     notification.info({
  //       key: 'dashboard_fullscreen',
  //       message: (
  //         <div>
  //           <div>{t('dashboard:detail.fullscreen.notification.esc')}</div>
  //         </div>
  //       ),
  //       duration: 3,
  //     });
  //   }
  // }, [query.viewMode]);

  useEffect(() => {
    setLoading(true);
    getEmbeddedDashboards()
      .then((res) => {
        setData(res);

        if (res && !_.isEmpty(res) && !activeRecord) {
          const headRecord = res[0];
          let id = headRecord.id;
          if (_.find(res, (item) => item.id === localStorage.getItem(LOCAL_STORAGE_KEY))) {
            id = localStorage.getItem(LOCAL_STORAGE_KEY) as string;
          }
          history.replace({
            pathname: '/embedded-dashboards',
            search: queryString.stringify({
              ...query,
              id,
            }),
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Spin spinning={loading}>
        <div style={{ width: 100, height: 100 }} />
      </Spin>
    );
  }

  return (
    <PageLayout
      title={
        activeRecord ? (
          <Space size={16}>
            <Dropdown
              trigger={['click']}
              visible={dashboardListDropdownVisible}
              onVisibleChange={(visible) => {
                setDashboardListDropdownVisible(visible);
              }}
              overlay={
                <div className='collects-payloads-dropdown-overlay p2 n9e-fill-color-2 n9e-border-base n9e-border-radius-base n9e-base-shadow'>
                  <Input
                    className='mb1'
                    placeholder={t('common:search_placeholder')}
                    value={dashboardListDropdownSearch}
                    onChange={(e) => {
                      setDashboardListDropdownSearch(e.target.value);
                    }}
                  />
                  <Menu>
                    {_.map(
                      _.filter(data, (item) => {
                        return _.includes(_.toLower(item.name), _.toLower(dashboardListDropdownSearch));
                      }),
                      (item) => {
                        return (
                          <Menu.Item
                            key={item.id}
                            onClick={() => {
                              history.push(`/embedded-dashboards?id=${item.id}`);
                              setDashboardListDropdownVisible(false);
                              setDashboardListDropdownSearch('');
                              localStorage.setItem(LOCAL_STORAGE_KEY, item.id);
                            }}
                          >
                            {item.name}
                          </Menu.Item>
                        );
                      },
                    )}
                  </Menu>
                </div>
              }
            >
              <Space size={4} style={{ cursor: 'pointer' }}>
                {activeRecord.name}
                <DownOutlined style={{ marginRight: 0, fontSize: 12 }} />
              </Space>
            </Dropdown>
            <AuthorizationWrapper allowedPerms={['/embedded-dashboards/put']}>
              <SettingOutlined
                style={{ margin: 0 }}
                onClick={() => {
                  FormModal({
                    initialValues: data,
                    onOk: (newData) => {
                      setData(newData);
                    },
                  });
                }}
              />
            </AuthorizationWrapper>
            <Tooltip title={t('exitFullScreen_tip')}>
              <FullscreenOutlined
                style={{ margin: 0 }}
                onClick={() => {
                  isClickTrigger.current = true;
                  history.push({
                    pathname: location.pathname,
                    search: queryString.stringify({
                      ...query,
                      viewMode: 'fullscreen',
                    }),
                  });
                }}
              />
            </Tooltip>
          </Space>
        ) : (
          t('title')
        )
      }
    >
      {_.isEmpty(data) ? (
        <div>
          <div
            className=''
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Space>
                  {t('common:nodata')}
                  <AuthorizationWrapper allowedPerms={['/embedded-dashboards/put']}>
                    <a
                      onClick={() => {
                        FormModal({
                          initialValues: data,
                          onOk: (newData) => {
                            setData(newData);
                          },
                        });
                      }}
                    >
                      {t('edit_btn')}
                    </a>
                  </AuthorizationWrapper>
                </Space>
              }
            />
          </div>
        </div>
      ) : activeRecord ? (
        <iframe className='embedded-dashboards-iframe' src={adjustURL(activeRecord.url, darkMode)} width='100%' height='100%' />
      ) : null}
    </PageLayout>
  );
}
