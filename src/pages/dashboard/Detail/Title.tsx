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
import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import querystring from 'query-string';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Button, Space, Dropdown, Menu, Switch } from 'antd';
import { RollbackOutlined } from '@ant-design/icons';
import { TimeRangePickerWithRefresh, IRawTimeRange } from '@/components/TimeRangePicker';
import { AddPanelIcon } from '../config';
import { visualizations } from '../Editor/config';
import { dashboardTimeCacheKey } from './Detail';

interface IProps {
  dashboard: any;
  range: IRawTimeRange;
  setRange: (range: IRawTimeRange) => void;
  onAddPanel: (type: string) => void;
  isPreview: boolean;
  isBuiltin: boolean;
  gobackPath?: string;
}

export default function Title(props: IProps) {
  const { t, i18n } = useTranslation('dashboard');
  const { dashboard, range, setRange, onAddPanel, isPreview, isBuiltin } = props;
  const history = useHistory();
  const location = useLocation();
  const query = querystring.parse(location.search);
  const { viewMode, themeMode } = query;

  return (
    <div className='dashboard-detail-header'>
      <div className='dashboard-detail-header-left'>
        {isPreview && !isBuiltin ? null : <RollbackOutlined className='back' onClick={() => history.push(props.gobackPath || '/dashboards')} />}
        <div className='title'>{dashboard.name}</div>
      </div>
      <div className='dashboard-detail-header-right'>
        <Space>
          <div>
            {!isPreview && (
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {_.map([{ type: 'row', name: '分组' }, ...visualizations], (item) => {
                      return (
                        <Menu.Item
                          key={item.type}
                          onClick={() => {
                            onAddPanel(item.type);
                          }}
                        >
                          {i18n.language === 'en_US' ? item.type : item.name}
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
          </div>
          <TimeRangePickerWithRefresh
            localKey={dashboardTimeCacheKey}
            dateFormat='YYYY-MM-DD HH:mm:ss'
            // refreshTooltip={t('refresh_tip', { num: getStepByTimeAndStep(range, step) })}
            value={range}
            onChange={setRange}
          />
          {!isPreview && (
            <Button
              onClick={() => {
                const newQuery = _.omit(query, ['viewMode', 'themeMode']);
                if (!viewMode) {
                  newQuery.viewMode = 'fullscreen';
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
          )}
          {viewMode === 'fullscreen' && (
            <Switch
              checkedChildren='dark'
              unCheckedChildren='light'
              checked={themeMode === 'dark'}
              onChange={(checked) => {
                const newQuery = _.omit(query, ['themeMode']);
                if (checked) {
                  newQuery.themeMode = 'dark';
                }
                history.replace({
                  pathname: location.pathname,
                  search: querystring.stringify(newQuery),
                });
              }}
            />
          )}
        </Space>
      </div>
    </div>
  );
}
