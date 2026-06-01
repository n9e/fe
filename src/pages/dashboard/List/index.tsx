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
/**
 * 仪表盘列表页面
 */
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Space, message, Tooltip } from 'antd';
import { FundViewOutlined, EditOutlined, ShareAltOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useUpdateEffect } from 'ahooks';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';

import { Dashboard as DashboardType } from '@/store/dashboardInterface';
import { getBusiGroupsDashboards, getBusiGroupsPublicDashboards, cloneDashboard, removeDashboards, getDashboard, updateDashboardPublic } from '@/services/dashboardV2';
import PageLayout from '@/components/pageLayout';
import { CommonStateContext } from '@/App';
import BusinessGroupSideBarWithAll, { getDefaultGidsInDashboard } from '@/components/BusinessGroup/BusinessGroupSideBarWithAll';
import EnhancedTable from '@/components/EnhancedTable';
import { dateColumn, userColumn } from '@/components/EnhancedTable/columns';
import Tags from '@/components/TableTags/Tags';
import EllipsisText from '@/components/EllipsisText';
import usePagination from '@/components/usePagination';
import { getDefaultColumnsConfigs, ajustColumns } from '@/components/OrganizeColumns';
import { getBusiGroups } from '@/components/BusinessGroup';

import { defaultColumnsConfigs, LOCAL_STORAGE_KEY } from './constants';
import Header from './Header';
import FormModal from './FormModal';
import Export from './Export';
import { exportDataStringify } from './utils';
import PublicForm from './PublicForm';

import './style.less';

const N9E_GIDS_LOCALKEY = 'N9E_BOARD_NODE_ID';
const SEARCH_SESSION_STORAGE_KEY = 'n9e_dashboard_search';
const PUBLIC_SELECT_GIDS_LOCALKEY = 'N9E_PUBLIC_SELECT_GIDS';
const getDefaultPublicSelectGids = (localKey: string) => {
  const valueStr = localStorage.getItem(localKey);
  const value = valueStr ? _.map(_.split(valueStr, ','), _.toNumber) : [];
  return value;
};

export default function index() {
  const { t } = useTranslation('dashboard');
  const { businessGroup, perms } = useContext(CommonStateContext);
  const queryParams = queryString.parse(useLocation().search);
  const [gids, setGids] = useState<string | undefined>(getDefaultGidsInDashboard(queryParams, N9E_GIDS_LOCALKEY, businessGroup));
  const [list, setList] = useState<any[]>([]);
  const [selectRowKeys, setSelectRowKeys] = useState<number[]>([]);
  const [refreshKey, setRefreshKey] = useState(_.uniqueId('refreshKey_'));
  const [searchVal, setsearchVal] = useState<string>(sessionStorage.getItem(SEARCH_SESSION_STORAGE_KEY) || '');
  const [selectedBusinessGroup, setSelectedBusinessGroup] = useState<number[] | undefined>(getDefaultPublicSelectGids(PUBLIC_SELECT_GIDS_LOCALKEY)); // 目前只有公开仪表盘会用到
  const [busiGroups, setBusiGroups] = useState<any[]>([]);
  const pagination = usePagination({ PAGESIZE_KEY: 'dashboard-pagesize' });
  const [columnsConfigs, setColumnsConfigs] = useState<{ name: string; visible: boolean }[]>(getDefaultColumnsConfigs(defaultColumnsConfigs, LOCAL_STORAGE_KEY));

  useUpdateEffect(() => {
    setGids(businessGroup.ids);
    setsearchVal('');
    sessionStorage.removeItem(SEARCH_SESSION_STORAGE_KEY);
  }, [businessGroup.ids]);

  useEffect(() => {
    if (gids === '-1') {
      getBusiGroupsPublicDashboards().then((res) => {
        setList(res);
      });
    } else {
      getBusiGroupsDashboards(gids === '-2' ? undefined : gids).then((res) => {
        setList(res);
      });
    }
  }, [gids, refreshKey]);

  const data = _.filter(list, (item) => {
    let flag = true;
    // 公开仪表盘需要对单独的业务组选择器选择的值过滤
    if (gids === '-1' && !_.isEmpty(selectedBusinessGroup)) {
      flag = _.includes(selectedBusinessGroup, item.group_id);
    }
    if (searchVal && flag) {
      flag =
        _.includes(item.name.toLowerCase(), searchVal.toLowerCase()) ||
        _.includes(_.join(_.sortBy(_.split(item.tags.toLowerCase(), ' ')), ' '), _.join(_.sortBy(_.split(searchVal.toLowerCase(), ' ')), ' '));
    }
    return flag;
  });

  useEffect(() => {
    getBusiGroups({ all: true }).then((res) => {
      setBusiGroups(res);
    });
  }, []);

  return (
    <PageLayout title={t('title')} icon={<FundViewOutlined />} doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/quickstart/dashboard/'>
      <div style={{ display: 'flex' }}>
        <BusinessGroupSideBarWithAll
          gids={gids}
          setGids={setGids}
          localeKey={N9E_GIDS_LOCALKEY}
          showPublicOption={_.includes(perms, '/public-dashboards')}
          publicOptionLabel={t('default_filter.public')}
          allOptionLabel={t('default_filter.all')}
          allOptionTooltip={t('default_filter.all_tip')}
        />
        <div className='fc-border rounded-lg dashboards-v2'>
          <Header
            gids={gids}
            selectRowKeys={selectRowKeys}
            refreshList={() => {
              setRefreshKey(_.uniqueId('refreshKey_'));
            }}
            searchVal={searchVal}
            onSearchChange={(val) => {
              setsearchVal(val);
              sessionStorage.setItem(SEARCH_SESSION_STORAGE_KEY, val);
            }}
            columnsConfigs={columnsConfigs}
            setColumnsConfigs={setColumnsConfigs}
            selectedBusinessGroup={selectedBusinessGroup}
            setSelectedBusinessGroup={(val) => {
              setSelectedBusinessGroup(val);
              localStorage.setItem(PUBLIC_SELECT_GIDS_LOCALKEY, _.join(val, ','));
            }}
          />
          <EnhancedTable
            className='mt-2'
            dataSource={data}
            columns={ajustColumns(
              _.concat([
                {
                  title: t('name'),
                  dataIndex: 'name',
                  className: 'name-column',
                  render: (text: string, record: DashboardType) => {
                    const groupName = _.find(busiGroups, { id: record.group_id })?.name;
                    return (
                      <div className='flex flex-col gap-0.5'>
                        <Link
                          className='table-active-text'
                          to={{
                            pathname: `/dashboards/${record.ident || record.id}`,
                            search: gids === '-1' ? '__public__=true' : '', // 加上 __public__ 参数，用于在详情页判断是否为公开仪表盘
                          }}
                        >
                          {text}
                        </Link>
                        {groupName && <span className='text-soft text-xs'>{groupName}</span>}
                      </div>
                    );
                  },
                },
                {
                  title: t('tags'),
                  dataIndex: 'tags',
                  className: 'tags-column',
                  render: (text: string) => (
                    <Tags
                      type='outline'
                      data={_.compact(_.split(text, ' '))}
                      maxWidth={180}
                      onTagClick={(tag: string) => {
                        const queryItem = searchVal.length > 0 ? searchVal.split(' ') : [];
                        if (queryItem.includes(tag)) return;
                        setsearchVal((searchVal) => {
                          if (searchVal) {
                            sessionStorage.setItem(SEARCH_SESSION_STORAGE_KEY, searchVal + ' ' + tag);
                            return searchVal + ' ' + tag;
                          }
                          sessionStorage.setItem(SEARCH_SESSION_STORAGE_KEY, tag);
                          return tag;
                        });
                      }}
                    />
                  ),
                },
                {
                  title: t('common:table.note'),
                  dataIndex: 'note',
                  className: 'note-column',
                  ellipsis: { showTitle: false },
                  render: (text: string) => <EllipsisText text={text} />,
                },
                dateColumn({ title: t('common:table.update_at'), dataIndex: 'update_at', unix: true }),
                userColumn({ title: t('common:table.username'), dataIndex: 'update_by', nickname: 'update_by_nickname' }),
                {
                  title: t('public.name'),
                  width: 150,
                  dataIndex: 'public',
                  className: 'published-cell',
                  render: (val: number, record: DashboardType) => {
                    let content: React.ReactNode = null;
                    if (val === 1 && record.public_cate !== undefined) {
                      if (record.public_cate === 0) {
                        content = (
                          <Tooltip
                            overlayClassName='ant-tooltip-with-link'
                            title={
                              <>
                                <div>
                                  <Link
                                    target='_blank'
                                    to={{
                                      pathname: `/dashboards/share/${record.ident || record.id}`,
                                      search: 'themeMode=dark',
                                    }}
                                  >
                                    {t('public.theme_link.dark')}
                                  </Link>
                                </div>
                                <div>
                                  <Link
                                    target='_blank'
                                    to={{
                                      pathname: `/dashboards/share/${record.ident || record.id}`,
                                      search: 'themeMode=light',
                                    }}
                                  >
                                    {t('public.theme_link.light')}
                                  </Link>
                                </div>
                              </>
                            }
                          >
                            <Link
                              target='_blank'
                              to={{
                                pathname: `/dashboards/share/${record.ident || record.id}`,
                              }}
                            >
                              <ShareAltOutlined /> {t(`public.cate.${record.public_cate}`)}
                            </Link>
                          </Tooltip>
                        );
                      } else {
                        content = t(`public.cate.${record.public_cate}`);
                      }
                    } else {
                      content = t('public.unpublic');
                    }

                    return (
                      <Space>
                        {content}
                        {gids !== '-1' && (
                          <EditOutlined
                            onClick={() => {
                              PublicForm({
                                busiGroups,
                                boardId: record.id,
                                initialValues: {
                                  public: val,
                                  public_cate: record.public_cate,
                                  bgids: record.bgids,
                                },
                                onOk: () => {
                                  setRefreshKey(_.uniqueId('refreshKey_'));
                                },
                              });
                            }}
                          />
                        )}
                      </Space>
                    );
                  },
                },
              ]),
              columnsConfigs,
            )}
            rowActions={(record) => ({
              menu: _.compact([
                gids !== '-1'
                  ? {
                      key: 'edit',
                      icon: 'edit',
                      text: t('common:btn.edit'),
                      onClick: () => {
                        FormModal({
                          action: 'edit',
                          initialValues: record,
                          busiId: businessGroup.id,
                          onOk: () => {
                            setRefreshKey(_.uniqueId('refreshKey_'));
                          },
                        });
                      },
                    }
                  : undefined,
                gids && gids !== '-1'
                  ? {
                      key: 'clone',
                      icon: 'copy',
                      text: t('common:btn.clone'),
                      onClick: () => {
                        Modal.confirm({
                          title: t('common:confirm.clone'),
                          onOk: async () => {
                            await cloneDashboard(record.group_id, record.id);
                            message.success(t('common:success.clone'));
                            setRefreshKey(_.uniqueId('refreshKey_'));
                          },
                          onCancel() {},
                        });
                      },
                    }
                  : undefined,
                {
                  key: 'export',
                  icon: 'open',
                  text: t('common:btn.export'),
                  onClick: async () => {
                    const exportData = await getDashboard(record.id);
                    Export({
                      data: exportDataStringify(exportData),
                    });
                  },
                },
                gids !== '-1'
                  ? {
                      key: 'delete',
                      icon: 'delete',
                      text: t('common:btn.delete'),
                      danger: true,
                      onClick: () => {
                        Modal.confirm({
                          title: t('common:confirm.delete'),
                          onOk: async () => {
                            await removeDashboards([record.id]);
                            message.success(t('common:success.delete'));
                            setRefreshKey(_.uniqueId('refreshKey_'));
                          },
                          onCancel() {},
                        });
                      },
                    }
                  : undefined,
              ]) as any,
            })}
            actionColumn={{ title: t('common:table.operations'), width: 64 }}
            rowKey='id'
            size='small'
            rowSelection={{
              selectedRowKeys: selectRowKeys,
              onChange: (selectedRowKeys: number[]) => {
                setSelectRowKeys(selectedRowKeys);
              },
            }}
            pagination={pagination}
          />
        </div>
      </div>
    </PageLayout>
  );
}
