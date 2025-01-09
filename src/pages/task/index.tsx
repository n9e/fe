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
import React, { useContext, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Table, Divider, Checkbox, Row, Col, Input, Select, Button, Space } from 'antd';
import { SearchOutlined, CodeOutlined } from '@ant-design/icons';
import { ColumnProps } from 'antd/lib/table';
import _ from 'lodash';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useAntdTable } from 'ahooks';

import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import PageLayout, { HelpLink } from '@/components/pageLayout';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import { CommonStateContext } from '@/App';
import BusinessGroupSideBarWithAll, { getDefaultGids } from '@/components/BusinessGroup/BusinessGroupSideBarWithAll';

interface DataItem {
  id: number;
  title: string;
}

const N9E_GIDS_LOCALKEY = 'N9E_TASK_NODE_ID';

function getTableData(options: any, gids: string | undefined, query: string, mine: boolean, days: number) {
  if (gids) {
    const ids = gids === '-2' ? undefined : gids;
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
  const { t, i18n } = useTranslation('common');
  const [query, setQuery] = useState('');
  const [mine, setMine] = useState(true);
  const [days, setDays] = useState(7);
  const { businessGroup, busiGroups } = useContext(CommonStateContext);
  const [gids, setGids] = useState<string | undefined>(getDefaultGids(N9E_GIDS_LOCALKEY, businessGroup));
  const { tableProps } = useAntdTable((options) => getTableData(options, gids, query, mine, days), { refreshDeps: [gids, query, mine, days] });
  const columns: ColumnProps<DataItem>[] = _.concat(
    businessGroup.isLeaf
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
        title: 'ID',
        dataIndex: 'id',
        width: 100,
      },
      {
        title: t('task.title'),
        dataIndex: 'title',
        width: 200,
        render: (text, record) => {
          return <Link to={{ pathname: `/job-tasks/${record.id}/result` }}>{text}</Link>;
        },
      },
      {
        title: t('table.operations'),
        width: 150,
        render: (_text, record) => {
          return (
            <span>
              <Link to={{ pathname: '/job-tasks/add', search: `task=${record.id}` }}>{t('task.clone')}</Link>
              <Divider type='vertical' />
              <Link to={{ pathname: `/job-tasks/${record.id}/detail` }}>{t('task.meta')}</Link>
            </span>
          );
        },
      },
      {
        title: t('task.creator'),
        dataIndex: 'create_by',
        width: 100,
      },
      {
        title: t('task.created'),
        dataIndex: 'create_at',
        width: 160,
        render: (text) => {
          return moment.unix(text).format('YYYY-MM-DD HH:mm:ss');
        },
      },
    ],
  );

  return (
    <PageLayout
      icon={<CodeOutlined />}
      title={
        <Space>
          {t('task')}
          <HelpLink src='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/alarm_self-healing/create-temporary-task/' />
        </Space>
      }
    >
      <div style={{ display: 'flex' }}>
        <BusinessGroupSideBarWithAll gids={gids} setGids={setGids} localeKey={N9E_GIDS_LOCALKEY} allOptionLabel={t('common:task.allOptionLabel')} />
        {gids ? (
          <div className='n9e-border-base p2' style={{ flex: 1 }}>
            <Row>
              <Col span={16} className='mb10'>
                <Input
                  style={{ width: 200, marginRight: 10 }}
                  prefix={<SearchOutlined />}
                  defaultValue={query}
                  onPressEnter={(e) => {
                    setQuery(e.currentTarget.value);
                  }}
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
              </Col>
              {businessGroup.isLeaf && (
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
            <Table
              className='mt8'
              size='small'
              rowKey='id'
              columns={columns as any}
              {...(tableProps as any)}
              pagination={
                {
                  ...tableProps.pagination,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '50', '100', '500', '1000'],
                  showTotal: (total) => {
                    return i18n.language == 'en' ? `Total ${total} items` : `共 ${total} 条`;
                  },
                } as any
              }
            />
          </div>
        ) : (
          <BlankBusinessPlaceholder text={t('task')}></BlankBusinessPlaceholder>
        )}
      </div>
    </PageLayout>
  );
};

export default index;
