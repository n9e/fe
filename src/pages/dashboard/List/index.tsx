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
 * 大盘列表页面
 */
import React, { useState, useEffect, useContext } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { Table, Tag, Modal, Switch, message } from 'antd';
import { FundViewOutlined } from '@ant-design/icons';
import moment from 'moment';
import _ from 'lodash';
import queryString from 'query-string';
import { useTranslation } from 'react-i18next';
import { Dashboard as DashboardType } from '@/store/dashboardInterface';
import { getDashboards, cloneDashboard, removeDashboards, getDashboard, updateDashboardPublic } from '@/services/dashboardV2';
import PageLayout from '@/components/pageLayout';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import { CommonStateContext } from '@/App';
import { BusinessGroup } from '@/pages/targets';
import usePagination from '@/components/usePagination';
import { getDefaultDatasourceValue } from '@/utils';
import Header from './Header';
import FormCpt from './Form';
import Export from './Export';
import { exportDataStringify } from './utils';
import './style.less';

export default function index() {
  const { t } = useTranslation('dashboard');
  const commonState = useContext(CommonStateContext);
  const { curBusiId: busiId } = commonState;
  const history = useHistory();
  const [list, setList] = useState<any[]>([]);
  const [selectRowKeys, setSelectRowKeys] = useState<number[]>([]);
  const [refreshKey, setRefreshKey] = useState(_.uniqueId('refreshKey_'));
  const [searchVal, setsearchVal] = useState<string>('');
  const pagination = usePagination({ PAGESIZE_KEY: 'dashboard-pagesize' });

  useEffect(() => {
    if (busiId) {
      getDashboards(busiId).then((res) => {
        setList(res);
      });
    }
  }, [busiId, refreshKey]);

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
          curBusiId={busiId}
          setCurBusiId={(id) => {
            commonState.setCurBusiId(id);
          }}
        />
        {busiId ? (
          <div className='dashboards-v2'>
            <Header
              busiId={busiId}
              selectRowKeys={selectRowKeys}
              refreshList={() => {
                setRefreshKey(_.uniqueId('refreshKey_'));
              }}
              searchVal={searchVal}
              onSearchChange={setsearchVal}
            />
            <Table
              dataSource={data}
              columns={[
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
                  width: 120,
                  dataIndex: 'update_at',
                  render: (text: number) => moment.unix(text).format('YYYY-MM-DD HH:mm:ss'),
                },
                {
                  title: t('common:table.create_by'),
                  width: 70,
                  dataIndex: 'create_by',
                },
                {
                  title: t('public.name'),
                  width: 120,
                  dataIndex: 'public',
                  render: (text: number, record: DashboardType) => {
                    return (
                      <div>
                        <Switch
                          checked={text === 1}
                          onChange={() => {
                            Modal.confirm({
                              title: record.public ? t('public.1.confirm') : t('public.0.confirm'),
                              onOk: async () => {
                                await updateDashboardPublic(record.id, { public: record.public ? 0 : 1 });
                                message.success(record.public ? t('public.1.success') : t('public.0.success'));
                                setRefreshKey(_.uniqueId('refreshKey_'));
                              },
                            });
                          }}
                        />
                        {text === 1 && (
                          <Link
                            target='_blank'
                            to={{
                              pathname: `/dashboards/share/${record.id}`,
                              search: queryString.stringify({
                                __datasourceValue: getDefaultDatasourceValue('prometheus', commonState.groupedDatasourceList),
                                __datasourceName: _.find(commonState.datasourceList, { id: getDefaultDatasourceValue('prometheus', commonState.groupedDatasourceList) })?.name,
                                viewMode: 'fullscreen',
                              }),
                            }}
                            style={{ marginLeft: 10 }}
                          >
                            {t('common:btn.view')}
                          </Link>
                        )}
                      </div>
                    );
                  },
                },
                {
                  title: t('common:table.operations'),
                  width: '180px',
                  render: (text: string, record: DashboardType) => (
                    <div className='table-operator-area'>
                      <div
                        className='table-operator-area-normal'
                        onClick={() => {
                          FormCpt({
                            mode: 'edit',
                            initialValues: {
                              ...record,
                              tags: record.tags ? _.split(record.tags, ' ') : undefined,
                            },
                            busiId,
                            refreshList: () => {
                              setRefreshKey(_.uniqueId('refreshKey_'));
                            },
                          });
                        }}
                      >
                        {t('common:btn.modify')}
                      </div>
                      <div
                        className='table-operator-area-normal'
                        onClick={async () => {
                          Modal.confirm({
                            title: t('common:confirm.clone'),
                            onOk: async () => {
                              await cloneDashboard(busiId as number, record.id);
                              message.success(t('common:success.clone'));
                              setRefreshKey(_.uniqueId('refreshKey_'));
                            },

                            onCancel() {},
                          });
                        }}
                      >
                        {t('common:btn.clone')}
                      </div>
                      <div
                        className='table-operator-area-normal'
                        onClick={async () => {
                          const exportData = await getDashboard(record.id);
                          Export({
                            data: exportDataStringify(exportData),
                          });
                        }}
                      >
                        {t('common:btn.export')}
                      </div>
                      <div
                        className='table-operator-area-warning'
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
                      </div>
                    </div>
                  ),
                },
              ]}
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
          <BlankBusinessPlaceholder text='监控大盘' />
        )}
      </div>
    </PageLayout>
  );
}
