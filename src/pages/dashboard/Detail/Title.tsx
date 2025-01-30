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
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useHistory, useLocation, Link } from 'react-router-dom';
import querystring from 'query-string';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { Button, Space, Dropdown, Menu, notification, Input, message, Tooltip } from 'antd';
import { RollbackOutlined, SettingOutlined, SaveOutlined, FullscreenOutlined, DownOutlined } from '@ant-design/icons';
import { useKeyPress } from 'ahooks';
import { TimeRangePickerWithRefresh, IRawTimeRange } from '@/components/TimeRangePicker';
import { CommonStateContext } from '@/App';
import { IS_ENT } from '@/utils/constant';
import { updateDashboard, updateDashboardConfigs, getBusiGroupsDashboards } from '@/services/dashboardV2';
import DashboardLinks from '../DashboardLinks';
import { AddPanelIcon } from '../config';
import { visualizations } from '../Editor/config';
import FormModal from '../List/FormModal';
import ImportGrafanaURLFormModal from '../List/ImportGrafanaURLFormModal';
import { IDashboard, ILink } from '../types';
import { useGlobalState } from '../globalState';
import { goBack, dashboardTimeCacheKey } from './utils';

interface IProps {
  dashboard: IDashboard;
  dashboardLinks?: ILink[];
  setDashboardLinks: (links: ILink[]) => void;
  handleUpdateDashboardConfigs: (id: number, params: any) => void;
  range: IRawTimeRange;
  setRange: (range: IRawTimeRange) => void;
  intervalSeconds?: number;
  setIntervalSeconds: (intervalSeconds?: number) => void;
  onAddPanel: (type: string) => void;
  isPreview: boolean;
  isBuiltin: boolean;
  isAuthorized: boolean;
  gobackPath?: string;
  editable: boolean;
  updateAtRef: React.MutableRefObject<number | undefined>;
  allowedLeave: boolean;
  setAllowedLeave: (allowed: boolean) => void;
}

const cachePageTitle = document.title || 'Nightingale';

export default function Title(props: IProps) {
  const { t } = useTranslation('dashboard');
  const {
    dashboard,
    dashboardLinks,
    setDashboardLinks,
    handleUpdateDashboardConfigs,
    range,
    setRange,
    intervalSeconds,
    setIntervalSeconds,
    onAddPanel,
    isPreview,
    isBuiltin,
    isAuthorized,
    editable,
    updateAtRef,
    allowedLeave,
    setAllowedLeave,
  } = props;
  const history = useHistory();
  const location = useLocation();
  const { siteInfo, dashboardSaveMode } = useContext(CommonStateContext);
  const query = querystring.parse(location.search);
  const { viewMode, __public__ } = query;
  const isClickTrigger = useRef(false);
  const [dashboardList, setDashboardList] = useState<IDashboard[]>([]);
  const [dashboardListDropdownSearch, setDashboardListDropdownSearch] = useState('');
  const [dashboardListDropdownVisible, setDashboardListDropdownVisible] = useState(false);
  const [panelClipboard, setPanelClipboard] = useGlobalState('panelClipboard');

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
    if (query.viewMode === 'fullscreen' && isClickTrigger.current) {
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

  useEffect(() => {
    // __public__: true 为公开仪表盘，公开仪表盘不需要获取分组下的仪表盘列表
    if (__public__ !== 'true' && dashboard.group_id && isPreview === false) {
      getBusiGroupsDashboards(_.toString(dashboard.group_id)).then((res) => {
        setDashboardList(res);
      });
    }
  }, [__public__, dashboard?.group_id]);

  return (
    <div
      className={`dashboard-detail-header ${!IS_ENT ? 'n9e-page-header-content' : ''}`}
      style={{
        display: query.viewMode === 'fullscreen' ? 'none' : 'flex',
      }}
    >
      <div className='dashboard-detail-header-left'>
        {isPreview && !isBuiltin ? null : (
          <Space>
            <Tooltip title={isBuiltin ? t('back_icon_tip_is_built_in') : t('back_icon_tip')}>
              <RollbackOutlined
                className='back_icon'
                onClick={() => {
                  goBack(history).catch(() => {
                    history.push(props.gobackPath || '/dashboards');
                  });
                }}
              />
            </Tooltip>
            <Space className='pr1'>
              <Link to={props.gobackPath || '/dashboards'} style={{ fontSize: 14 }}>
                {isBuiltin ? t('builtInComponents:title') : t('list')}
              </Link>
              {'/'}
            </Space>
          </Space>
        )}
        {isPreview === true || __public__ === 'true' ? (
          // 公开仪表盘不显示下拉
          <div className='title'>{dashboard.name}</div>
        ) : (
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
                    _.filter(dashboardList, (item) => {
                      return _.includes(_.toLower(item.name), _.toLower(dashboardListDropdownSearch));
                    }),
                    (item) => {
                      return (
                        <Menu.Item
                          key={item.id}
                          onClick={() => {
                            history.push(`/dashboards/${item.ident || item.id}`);
                            setDashboardListDropdownVisible(false);
                            setDashboardListDropdownSearch('');
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
            <span style={{ cursor: 'pointer' }}>
              <span className='title'>{dashboard.name}</span> <DownOutlined />
            </span>
          </Dropdown>
        )}
      </div>

      <div className='dashboard-detail-header-right'>
        <Space>
          {isAuthorized && dashboardSaveMode === 'manual' && !allowedLeave && (
            <Button
              type={allowedLeave ? 'default' : 'primary'}
              onClick={() => {
                if (editable) {
                  updateDashboard(dashboard.id, {
                    name: dashboard.name,
                    ident: dashboard.ident,
                    tags: dashboard.tags,
                  });
                  updateDashboardConfigs(dashboard.id, {
                    configs: JSON.stringify(dashboard.configs),
                  }).then((res) => {
                    updateAtRef.current = res.update_at;
                    message.success(t('detail.saved'));
                    setAllowedLeave(true);
                  });
                } else {
                  message.warning(t('detail.expired'));
                }
              }}
            >
              {t('settings.save')}
            </Button>
          )}
          {dashboard.configs?.mode !== 'iframe' ? (
            <>
              {isAuthorized && (
                <Dropdown
                  trigger={['click']}
                  overlay={
                    <Menu>
                      {_.map(_.concat(panelClipboard ? [{ type: 'pastePanel' }] : [], [{ type: 'row', name: 'row' }], visualizations), (item) => {
                        return (
                          <Menu.Item
                            key={item.type}
                            onClick={() => {
                              onAddPanel(item.type);
                            }}
                          >
                            <Space align='center' style={{ lineHeight: 1 }}>
                              {item.type !== 'pastePanel' && <img height={16} alt={item.type} src={`/image/dashboard/${item.type}.svg`} />}
                              {t(`visualizations.${item.type}`)}
                            </Space>
                          </Menu.Item>
                        );
                      })}
                    </Menu>
                  }
                >
                  <Button type='primary' ghost icon={<AddPanelIcon />}>
                    {t('add_panel')}
                  </Button>
                </Dropdown>
              )}
              <TimeRangePickerWithRefresh
                localKey={`${dashboardTimeCacheKey}_${dashboard.id}`}
                dateFormat='YYYY-MM-DD HH:mm:ss'
                value={range}
                onChange={(val) => {
                  // 更改时间范围后同步到 URL
                  history.replace({
                    pathname: location.pathname,
                    search: querystring.stringify({
                      ...querystring.parse(window.location.search),
                      __from: moment.isMoment(val.start) ? val.start.valueOf() : val.start,
                      __to: moment.isMoment(val.end) ? val.end.valueOf() : val.end,
                    }),
                  });
                  setRange(val);
                }}
                intervalSeconds={intervalSeconds}
                onIntervalSecondsChange={(val) => {
                  const value = val > 0 ? val : undefined;
                  history.replace({
                    pathname: location.pathname,
                    search: querystring.stringify({
                      ...querystring.parse(window.location.search),
                      __refresh: value,
                    }),
                  });
                  setIntervalSeconds(value);
                }}
              />

              {(isAuthorized || dashboardSaveMode === 'manual') && (
                <Button
                  icon={<SettingOutlined />}
                  onClick={() => {
                    FormModal({
                      action: 'edit',
                      initialValues: dashboard,
                      dashboardSaveMode,
                      onOk: (values) => {
                        if (dashboardSaveMode === 'manual') {
                          const dashboardConfigs: any = dashboard.configs;
                          dashboardConfigs.graphTooltip = values.graphTooltip;
                          dashboardConfigs.graphZoom = values.graphZoom;
                          handleUpdateDashboardConfigs(dashboard.id, {
                            name: values.name,
                            ident: values.ident,
                            tags: _.join(values.tags, ' '),
                            configs: JSON.stringify(dashboardConfigs),
                          });
                        } else {
                          window.location.reload();
                        }
                      },
                    });
                  }}
                />
              )}
              <DashboardLinks
                editable={isAuthorized}
                value={dashboardLinks}
                onChange={(v) => {
                  const dashboardConfigs: any = dashboard.configs;
                  dashboardConfigs.links = v;
                  handleUpdateDashboardConfigs(dashboard.id, {
                    ...dashboard,
                    configs: JSON.stringify(dashboardConfigs),
                  });
                  setDashboardLinks(v);
                }}
              />
            </>
          ) : (
            <>
              {isAuthorized && (
                <Button
                  icon={<SettingOutlined />}
                  onClick={() => {
                    ImportGrafanaURLFormModal({
                      initialValues: dashboard,
                      onOk: () => {
                        window.location.reload();
                      },
                    });
                  }}
                />
              )}
            </>
          )}
          <Tooltip title={dashboard.configs?.mode === 'iframe' ? t('embeddedDashboards:exitFullScreen_tip') : undefined}>
            <Button
              onClick={() => {
                const newQuery = _.omit(querystring.parse(window.location.search), ['viewMode', 'themeMode']);
                if (!viewMode) {
                  newQuery.viewMode = 'fullscreen';
                  isClickTrigger.current = true;
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
              icon={<FullscreenOutlined />}
            />
          </Tooltip>
        </Space>
      </div>
    </div>
  );
}
