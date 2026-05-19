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
import { Table, Modal, Space, message, Tooltip } from 'antd';
import { FundViewOutlined, EditOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Copy, Download, Pencil, Trash2 } from 'lucide-react';
import moment from 'moment';
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
import usePagination from '@/components/usePagination';
import { getDefaultColumnsConfigs, ajustColumns } from '@/components/OrganizeColumns';
import { getBusiGroups } from '@/components/BusinessGroup';
import { TableActionDropdown, TableTags, TableUserCell } from '@/components/TableDesign';

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
    <PageLayout title={t('title')} icon={<FundViewOutlined />} doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v8/quickstart/dashboard/'>
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
          <Table
            className='mt-2'
            dataSource={data}
            columns={ajustColumns(
              _.concat(
                businessGroup.isLeaf && gids !== '-1' && gids !== '-2'
                  ? []
                  : ([
                      {
                        title: t('common:business_group'),
                        dataIndex: 'group_id',
                        width: 100,
                        render: (id) => {
                          return _.find(busiGroups, { id })?.name;
                        },
                      },
                    ] as any),
                [
                  {
                    title: t('name'),
                    dataIndex: 'name',
                    className: 'name-column',
                    render: (text: string, record: DashboardType) => {
                      return (
                        <Link
                          className='table-active-text'
                          to={{
                            pathname: `/dashboards/${record.ident || record.id}`,
                            search: gids === '-1' ? '__public__=true' : '', // 加上 __public__ 参数，用于在详情页判断是否为公开仪表盘
                          }}
                        >
                          {text}
                        </Link>
                      );
                    },
                  },
                  {
                    title: t('tags'),
                    dataIndex: 'tags',
                    className: 'tags-column',
                    render: (text: string) => (
                      <TableTags
                        data={_.filter(_.split(text, ' '), Boolean)}
                        onClick={(tag) => {
                          const tagText = _.toString(tag);
                          const queryItem = searchVal.length > 0 ? searchVal.split(' ') : [];
                          if (queryItem.includes(tagText)) return;
                          setsearchVal((searchVal) => {
                            if (searchVal) {
                              sessionStorage.setItem(SEARCH_SESSION_STORAGE_KEY, `${searchVal} ${tagText}`);
                              return `${searchVal} ${tagText}`;
                            }
                            sessionStorage.setItem(SEARCH_SESSION_STORAGE_KEY, tagText);
                            return tagText;
                          });
                        }}
                      />
                    ),
                  },
                  {
                    title: t('common:table.note'),
                    dataIndex: 'note',
                    className: 'note-column',
                  },
                  {
                    title: t('common:table.update_at'),
                    width: 150,
                    dataIndex: 'update_at',
                    render: (text: number) => moment.unix(text).format('YYYY-MM-DD HH:mm:ss'),
                  },
                  {
                    title: t('common:table.username'),
                    dataIndex: 'update_by',
                    width: 100,
                    render: (value: string, record: DashboardType) => <TableUserCell username={value} nickname={(record as any).update_by_nickname} />,
                  },
                  {
                    title: t('common:table.nickname'),
                    dataIndex: 'update_by_nickname',
                    width: 100,
                  },
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
                  {
                    title: t('common:table.operations'),
                    width: 64,
                    align: 'center',
                    fixed: 'right',
                    render: (text: string, record: DashboardType) => {
                      return (
                        <TableActionDropdown
                          items={_.compact([
                            gids !== '-1'
                              ? {
                                  key: 'edit',
                                  label: t('common:btn.edit'),
                                  icon: <Pencil size={16} />,
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
                                  label: t('common:btn.clone'),
                                  icon: <Copy size={16} />,
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
                              label: t('common:btn.export'),
                              icon: <Download size={16} />,
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
                                  label: t('common:btn.delete'),
                                  icon: <Trash2 size={16} />,
                                  danger: true,
                                  dividerBefore: true,
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
                          ])}
                        />
                      );
                    },
                  },
                ],
              ),
              columnsConfigs,
            )}
            rowKey='id'
            size='small'
            rowSelection={{
              selectedRowKeys: selectRowKeys,
              onChange: (selectedRowKeys: number[]) => {
                setSelectRowKeys(selectedRowKeys);
              },
            }}
            pagination={pagination}
            scroll={{ x: 'max-content' }}
          />
        </div>
      </div>
    </PageLayout>
  );
}
