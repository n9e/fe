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
import { Table, Tag, Modal, Space, Button, Dropdown, Menu, message } from 'antd';
import { FundViewOutlined, EditOutlined, ShareAltOutlined, MoreOutlined } from '@ant-design/icons';
import moment from 'moment';
import _ from 'lodash';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useUpdateEffect } from 'ahooks';
import { Dashboard as DashboardType } from '@/store/dashboardInterface';
import { getBusiGroupsDashboards, getBusiGroupsPublicDashboards, cloneDashboard, removeDashboards, getDashboard, updateDashboardPublic } from '@/services/dashboardV2';
import PageLayout from '@/components/pageLayout';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import { CommonStateContext } from '@/App';
import BusinessGroup, { getCleanBusinessGroupIds } from '@/components/BusinessGroup';
import usePagination from '@/components/usePagination';
import OrganizeColumns, { getDefaultColumnsConfigs, setDefaultColumnsConfigs, ajustColumns } from '@/components/OrganizeColumns';
import { defaultColumnsConfigs, LOCAL_STORAGE_KEY } from './constants';
import Header from './Header';
import FormModal from './FormModal';
import Export from './Export';
import { exportDataStringify } from './utils';
import PublicForm from './PublicForm';
import './style.less';

const N9E_BOARD_NODE_ID = 'N9E_BOARD_NODE_ID';

export default function index() {
  const { t } = useTranslation('dashboard');
  const { businessGroup, busiGroups } = useContext(CommonStateContext);
  const [gids, setGids] = useState<string | undefined>(localStorage.getItem(N9E_BOARD_NODE_ID) || businessGroup.ids); // -1: 公开仪表盘, -2: 所有仪表盘
  const [list, setList] = useState<any[]>([]);
  const [selectRowKeys, setSelectRowKeys] = useState<number[]>([]);
  const [refreshKey, setRefreshKey] = useState(_.uniqueId('refreshKey_'));
  const [searchVal, setsearchVal] = useState<string>('');
  const pagination = usePagination({ PAGESIZE_KEY: 'dashboard-pagesize' });
  const [columnsConfigs, setColumnsConfigs] = useState<{ name: string; visible: boolean }[]>(getDefaultColumnsConfigs(defaultColumnsConfigs, LOCAL_STORAGE_KEY));

  useUpdateEffect(() => {
    setGids(businessGroup.ids);
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
    if (searchVal) {
      return _.includes(item.name.toLowerCase(), searchVal.toLowerCase()) || item.tags.toLowerCase().includes(searchVal.toLowerCase());
    }
    return true;
  });

  return (
    <PageLayout title={t('title')} icon={<FundViewOutlined />}>
      <div style={{ display: 'flex' }}>
        <BusinessGroup
          renderHeadExtra={() => {
            return (
              <div>
                <div className='n9e-biz-group-container-group-title'>{t('default_filter.title')}</div>
                <div
                  className={classNames({
                    'n9e-biz-group-item': true,
                    active: gids === '-1',
                  })}
                  onClick={() => {
                    setGids('-1');
                    localStorage.setItem(N9E_BOARD_NODE_ID, '-1');
                  }}
                >
                  {t('default_filter.public')}
                </div>
                <div
                  className={classNames({
                    'n9e-biz-group-item': true,
                    active: gids === '-2',
                  })}
                  onClick={() => {
                    setGids('-2');
                    localStorage.setItem(N9E_BOARD_NODE_ID, '-2');
                  }}
                >
                  {t('default_filter.all')}
                </div>
              </div>
            );
          }}
          showSelected={gids !== '-1' && gids !== '-2'}
          onSelect={(key) => {
            const ids = getCleanBusinessGroupIds(key);
            setGids(ids);
            localStorage.removeItem(N9E_BOARD_NODE_ID);
          }}
        />
        {businessGroup.ids ? (
          <div className='n9e-border-base dashboards-v2'>
            <Header
              gids={gids}
              selectRowKeys={selectRowKeys}
              refreshList={() => {
                setRefreshKey(_.uniqueId('refreshKey_'));
              }}
              searchVal={searchVal}
              onSearchChange={setsearchVal}
              columnsConfigs={columnsConfigs}
              setColumnsConfigs={setColumnsConfigs}
            />
            <Table
              className='mt8'
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
                        <>
                          {_.map(_.split(text, ' '), (tag, index) => {
                            return tag ? (
                              <Tag
                                color='purple'
                                key={index}
                                style={{
                                  cursor: 'pointer',
                                }}
                                onClick={() => {
                                  const queryItem = searchVal.length > 0 ? searchVal.split(' ') : [];
                                  if (queryItem.includes(tag)) return;
                                  setsearchVal((searchVal) => {
                                    if (searchVal) {
                                      return searchVal + ' ' + tag;
                                    }
                                    return tag;
                                  });
                                }}
                              >
                                {tag}
                              </Tag>
                            ) : null;
                          })}
                        </>
                      ),
                    },
                    {
                      title: t('common:table.update_at'),
                      width: 150,
                      dataIndex: 'update_at',
                      render: (text: number) => moment.unix(text).format('YYYY-MM-DD HH:mm:ss'),
                    },
                    {
                      title: t('common:table.update_by'),
                      dataIndex: 'update_by',
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
                              <Link
                                target='_blank'
                                to={{
                                  pathname: `/dashboards/share/${record.id}`,
                                }}
                              >
                                <ShareAltOutlined /> {t(`public.cate.${record.public_cate}`)}
                              </Link>
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
                      render: (text: string, record: DashboardType) => {
                        return (
                          <Dropdown
                            overlay={
                              <Menu>
                                {gids !== '-1' && (
                                  <Menu.Item>
                                    <Button
                                      type='link'
                                      className='p0'
                                      onClick={() => {
                                        FormModal({
                                          action: 'edit',
                                          initialValues: record,
                                          busiId: businessGroup.id,
                                          onOk: () => {
                                            setRefreshKey(_.uniqueId('refreshKey_'));
                                          },
                                        });
                                      }}
                                    >
                                      {t('common:btn.edit')}
                                    </Button>
                                  </Menu.Item>
                                )}
                                {gids && gids !== '-1' && (
                                  <Menu.Item>
                                    <Button
                                      type='link'
                                      className='p0'
                                      onClick={async () => {
                                        Modal.confirm({
                                          title: t('common:confirm.clone'),
                                          onOk: async () => {
                                            await cloneDashboard(record.group_id, record.id);
                                            message.success(t('common:success.clone'));
                                            setRefreshKey(_.uniqueId('refreshKey_'));
                                          },

                                          onCancel() {},
                                        });
                                      }}
                                    >
                                      {t('common:btn.clone')}
                                    </Button>
                                  </Menu.Item>
                                )}
                                <Menu.Item>
                                  <Button
                                    type='link'
                                    className='p0'
                                    onClick={async () => {
                                      const exportData = await getDashboard(record.id);
                                      Export({
                                        data: exportDataStringify(exportData),
                                      });
                                    }}
                                  >
                                    {t('common:btn.export')}
                                  </Button>
                                </Menu.Item>
                                {gids !== '-1' && (
                                  <Menu.Item>
                                    <Button
                                      danger
                                      type='link'
                                      className='p0'
                                      onClick={async () => {
                                        Modal.confirm({
                                          title: t('common:confirm.delete'),
                                          onOk: async () => {
                                            await removeDashboards([record.id]);
                                            message.success(t('common:success.delete'));
                                            setRefreshKey(_.uniqueId('refreshKey_'));
                                          },

                                          onCancel() {},
                                        });
                                      }}
                                    >
                                      {t('common:btn.delete')}
                                    </Button>
                                  </Menu.Item>
                                )}
                              </Menu>
                            }
                          >
                            <Button type='link' icon={<MoreOutlined />} />
                          </Dropdown>
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
            />
          </div>
        ) : (
          <BlankBusinessPlaceholder text={t('title')} />
        )}
      </div>
    </PageLayout>
  );
}
