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
import React, { useContext, useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Checkbox, Row, Col, Select, Button, Space } from 'antd';
import { CodeOutlined } from '@ant-design/icons';
import { ColumnProps } from 'antd/lib/table';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useAntdTable } from 'ahooks';
import EnhancedTable from '@/components/EnhancedTable';
import { userColumn, dateColumn } from '@/components/EnhancedTable/columns';

import request from '@/utils/request';
import api from '@/utils/api';
import { RequestMethod } from '@/store/common';
import PageLayout from '@/components/pageLayout';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import { CommonStateContext } from '@/App';
import BusinessGroupSideBarWithAll, { getDefaultGids } from '@/components/BusinessGroup/BusinessGroupSideBarWithAll';
import RefreshIcon from '@/components/RefreshIcon';
import usePagination from '@/components/usePagination';
import SearchInput from '@/components/BaseSearchInput';
import MetaDrawer from './MetaDrawer';

interface DataItem {
  id: number;
  title: string;
}

const N9E_GIDS_LOCALKEY = 'N9E_TASK_NODE_ID';

const FILTER_SESSION_KEY = 'task_filter';
const PAGE_SESSION_KEY = 'task_page';

function getDefaultFilter() {
  try {
    return JSON.parse(window.sessionStorage.getItem(FILTER_SESSION_KEY) || '{}');
  } catch {
    return {};
  }
}

function getTableData(options: any, gids: string | undefined, query: string, mine: boolean, days: number) {
  if (gids) {
    const ids = gids === '-2' ? undefined : gids;
    sessionStorage.setItem(PAGE_SESSION_KEY, String(options.current));
    return request(`/api/n9e/busi-groups/tasks`, {
      method: RequestMethod.Get,
      params: {
        gids: ids,
        limit: options.pageSize,
        p: options.current,
        query: query,
        mine: mine ? 1 : 0,
        days: days,
      },
    }).then((res) => {
      return { list: res.dat.list, total: res.dat.total };
    });
  }
  return Promise.resolve({ list: [], total: 0 });
}

const index = (_props: any) => {
  const history = useHistory();
  const { t } = useTranslation('common');
  const defaultFilter = getDefaultFilter();
  const [query, setQuery] = useState(defaultFilter.query || '');
  const [mine, setMine] = useState(defaultFilter.mine !== undefined ? defaultFilter.mine : true);
  const [days, setDays] = useState(defaultFilter.days || 7);
  const { businessGroup, busiGroups } = useContext(CommonStateContext);
  const [gids, setGids] = useState<string | undefined>(getDefaultGids(N9E_GIDS_LOCALKEY, businessGroup));
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('task-refresh-'));
  const [metaDrawerVisible, setMetaDrawerVisible] = useState(false);
  const [metaDrawerLoading, setMetaDrawerLoading] = useState(false);
  const [metaDrawerData, setMetaDrawerData] = useState<any>({});
  const [metaDrawerHosts, setMetaDrawerHosts] = useState<any[]>([]);
  const [metaDrawerTaskId, setMetaDrawerTaskId] = useState<string>('');
  const pagination = usePagination({ PAGESIZE_KEY: 'job-tasks-pagesize' });

  useEffect(() => {
    window.sessionStorage.setItem(FILTER_SESSION_KEY, JSON.stringify({ query, mine, days }));
  }, [query, mine, days]);

  const defaultPage = Number(sessionStorage.getItem(PAGE_SESSION_KEY) || '1');
  const { tableProps } = useAntdTable((options) => getTableData(options, gids, query, mine, days), {
    refreshDeps: [gids, query, mine, days, refreshFlag],
    defaultPageSize: pagination.pageSize,
    defaultCurrent: defaultPage,
  });

  const handleOpenMetaDrawer = (record: any) => {
    setMetaDrawerTaskId(String(record.id));
    setMetaDrawerData({});
    setMetaDrawerHosts([]);
    setMetaDrawerLoading(true);
    setMetaDrawerVisible(true);
    request(`${api.task(businessGroup.id!)}/${record.id}`)
      .then((data) => {
        setMetaDrawerData({
          ...data.dat.meta,
        });
        setMetaDrawerHosts(data.dat.hosts);
      })
      .catch(() => {})
      .finally(() => {
        setMetaDrawerLoading(false);
      });
  };

  const showBusinessGroup = !(businessGroup.isLeaf && gids !== '-2');
  const columns: ColumnProps<DataItem>[] = _.concat(
    [
      {
        title: t('task.title'),
        dataIndex: 'title',
        width: 240,
        render: (text, record) => {
          const groupName = _.find(busiGroups, { id: record.group_id })?.name;
          return (
            <div className='flex flex-col gap-0.5'>
              <Link to={{ pathname: `/job-tasks/${record.id}/result` }}>{text}</Link>
              <span className='text-soft text-xs inline-flex items-center gap-2'>
                <span>ID: {record.id}</span>
                {showBusinessGroup && groupName && <span>{groupName}</span>}
              </span>
            </div>
          );
        },
      },
    ] as any,
    [
      userColumn({ title: t('task.creator'), dataIndex: 'create_by', nickname: 'create_by_nickname' }),
      dateColumn({ title: t('task.created'), dataIndex: 'create_at', unix: true }),
    ] as any,
  );

  return (
    <PageLayout
      icon={<CodeOutlined />}
      title={<Space>{t('task')}</Space>}
      doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/self-healing/create-temporary-task/'
    >
      <div style={{ display: 'flex' }}>
        <BusinessGroupSideBarWithAll gids={gids} setGids={setGids} localeKey={N9E_GIDS_LOCALKEY} allOptionLabel={t('common:task.allOptionLabel')} />
        {gids ? (
          <div className='fc-border rounded-lg p-4' style={{ flex: 1 }}>
            <Row>
              <Col span={16} className='mb-2'>
                <Space>
                  <RefreshIcon
                    onClick={() => {
                      setRefreshFlag(_.uniqueId('task-refresh-'));
                    }}
                  />
                  <SearchInput
                    value={query}
                    onSearch={(val) => {
                      setQuery(val);
                    }}
                    allowClear
                  />
                  <Select
                    style={{ marginRight: 10 }}
                    value={days}
                    onChange={(val: number) => {
                      setDays(val);
                    }}
                  >
                    <Select.Option value={7}>{t('last.7.days')}</Select.Option>
                    <Select.Option value={15}>{t('last.15.days')}</Select.Option>
                    <Select.Option value={30}>{t('last.30.days')}</Select.Option>
                    <Select.Option value={60}>{t('last.60.days')}</Select.Option>
                    <Select.Option value={90}>{t('last.90.days')}</Select.Option>
                  </Select>
                  <Checkbox
                    checked={mine}
                    onChange={(e) => {
                      setMine(e.target.checked);
                    }}
                  >
                    {t('task.only.mine')}
                  </Checkbox>
                </Space>
              </Col>
              {businessGroup.isLeaf && gids !== '-2' && (
                <Col span={8} style={{ textAlign: 'right' }}>
                  <Button
                    type='primary'
                    onClick={() => {
                      history.push('/job-tasks/add');
                    }}
                  >
                    {t('task.temporary.create')}
                  </Button>
                </Col>
              )}
            </Row>
            <EnhancedTable
              className='mt-2'
              size='small'
              rowKey='id'
              columns={columns as any}
              rowActions={(record) => ({
                menu: [
                  {
                    key: 'clone',
                    icon: 'copy',
                    text: t('task.clone'),
                    onClick: () => history.push({ pathname: '/job-tasks/add', search: `task=${record.id}` }),
                  },
                  { key: 'meta', icon: 'view', text: t('task.meta'), onClick: () => handleOpenMetaDrawer(record) },
                ],
              })}
              actionColumn={{ title: t('table.operations'), width: 64 }}
              {...(tableProps as any)}
              pagination={{
                ...pagination,
                ...tableProps.pagination,
              }}
            />
          </div>
        ) : (
          <BlankBusinessPlaceholder text={t('task')}></BlankBusinessPlaceholder>
        )}
      </div>
      <MetaDrawer
        visible={metaDrawerVisible}
        loading={metaDrawerLoading}
        onClose={() => setMetaDrawerVisible(false)}
        data={metaDrawerData}
        hosts={metaDrawerHosts}
        taskId={metaDrawerTaskId}
      />
    </PageLayout>
  );
};

export default index;
