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
import React, { useContext, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import querystring from 'query-string';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Button, Space, Dropdown, Menu, Switch, notification, Select } from 'antd';
import { RollbackOutlined, SettingOutlined } from '@ant-design/icons';
import { useKeyPress } from 'ahooks';
import { TimeRangePickerWithRefresh, IRawTimeRange } from '@/components/TimeRangePicker';
import { CommonStateContext } from '@/App';
import { AddPanelIcon } from '../config';
import { visualizations } from '../Editor/config';
import { dashboardTimeCacheKey } from './Detail';
import FormModal from '../List/FormModal';
import { IDashboard } from '../types';
import { dashboardThemeModeCacheKey, getDefaultThemeMode } from './utils';

interface IProps {
  dashboard: IDashboard;
  range: IRawTimeRange;
  setRange: (range: IRawTimeRange) => void;
  onAddPanel: (type: string) => void;
  isPreview: boolean;
  isBuiltin: boolean;
  isAuthorized: boolean;
  gobackPath?: string;
}

const cachePageTitle = document.title || 'Nightingale';

export default function Title(props: IProps) {
  const { t, i18n } = useTranslation('dashboard');
  const { dashboard, range, setRange, onAddPanel, isPreview, isBuiltin, isAuthorized } = props;
  const history = useHistory();
  const location = useLocation();
  const { siteInfo } = useContext(CommonStateContext);
  const query = querystring.parse(location.search);
  const { viewMode } = query;
  const themeMode = getDefaultThemeMode(query);

  useEffect(() => {
    document.title = `${dashboard.name} - ${siteInfo?.page_title || cachePageTitle}`;
    return () => {
      document.title = siteInfo?.page_title || cachePageTitle;
    };
  }, [dashboard.name]);

  useKeyPress('esc', () => {
    if (query.viewMode === 'fullscreen') {
      history.replace({
        pathname: location.pathname,
        search: querystring.stringify(_.omit(query, ['viewMode', 'themeMode'])),
      });
      notification.close('dashboard_fullscreen');
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 500);
    }
  });

  useEffect(() => {
    if (query.viewMode === 'fullscreen') {
      notification.info({
        key: 'dashboard_fullscreen',
        message: (
          <div>
            <div>{t('detail.fullscreen.notification.esc')}</div>
          </div>
        ),
        duration: 3,
      });
    }
  }, [query.viewMode]);

  return (
    <div
      className={`dashboard-detail-header ${import.meta.env.VITE_IS_ENT !== 'true' ? 'n9e-page-header-content' : ''}`}
      style={{
        display: query.viewMode === 'fullscreen' ? 'none' : 'flex',
      }}
    >
      <div className='dashboard-detail-header-left'>
        {isPreview && !isBuiltin ? null : <RollbackOutlined className='back' onClick={() => history.push(props.gobackPath || '/dashboards')} />}
        <div className='title'>{dashboard.name}</div>
      </div>
      <div className='dashboard-detail-header-right'>
        <Space>
          {isAuthorized && (
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  {_.map([{ type: 'row', name: 'row' }, ...visualizations], (item) => {
                    return (
                      <Menu.Item
                        key={item.type}
                        onClick={() => {
                          onAddPanel(item.type);
                        }}
                      >
                        {t(`visualizations.${item.type}`)}
                      </Menu.Item>
                    );
                  })}
                </Menu>
              }
            >
              <Button type='primary' icon={<AddPanelIcon />}>
                {t('add_panel')}
              </Button>
            </Dropdown>
          )}
          {isAuthorized && (
            <Button
              icon={<SettingOutlined />}
              onClick={() => {
                FormModal({
                  action: 'edit',
                  initialValues: dashboard,
                  onOk: () => {
                    window.location.reload();
                  },
                });
              }}
            />
          )}
          <TimeRangePickerWithRefresh localKey={dashboardTimeCacheKey} dateFormat='YYYY-MM-DD HH:mm:ss' value={range} onChange={setRange} />
          <Button
            onClick={() => {
              const newQuery = _.omit(query, ['viewMode', 'themeMode']);
              if (!viewMode) {
                newQuery.viewMode = 'fullscreen';
                newQuery.themeMode = localStorage.getItem(dashboardThemeModeCacheKey) || 'light';
              }
              history.replace({
                pathname: location.pathname,
                search: querystring.stringify(newQuery),
              });
              // TODO: 解决仪表盘 layout resize 问题
              setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
              }, 500);
            }}
          >
            {viewMode === 'fullscreen' ? t('exit_full_screen') : t('full_screen')}
          </Button>
        </Space>
      </div>
    </div>
  );
}
