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
import React, { useState, useContext, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Table, Modal, Tag, Row, Col, Button, Dropdown, Menu, message, Space } from 'antd';
import { DownOutlined, CodeOutlined } from '@ant-design/icons';
import { ColumnProps } from 'antd/lib/table';
import _ from 'lodash';
import moment from 'moment';
import { useAntdTable } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { TableActionButton, TableActionLink, TableActionTrigger, TableActionCell, TableActionIconButton } from '@/components/TableActionDropdown';
import Tags from '@/components/TableTags/Tags';

import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import api from '@/utils/api';
import PageLayout from '@/components/pageLayout';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import { CommonStateContext } from '@/App';
import BusinessGroupSideBarWithAll, { getDefaultGids } from '@/components/BusinessGroup/BusinessGroupSideBarWithAll';
import SearchInput from '@/components/BaseSearchInput';

import { Tpl } from './interface';
import BindTags from './bindTags';
import UnBindTags from './unBindTags';

const N9E_GIDS_LOCALKEY = 'N9E_TASK_TPL_NODE_ID';
const SEARCH_SESSION_KEY = 'taskTpl_query';

function getTableData(options: any, gids: string | undefined, query: string) {
  if (gids) {
    const ids = gids === '-2' ? undefined : gids;
    return request(`/api/n9e/busi-groups/task-tpls`, {
      method: RequestMethod.Get,
      params: {
        gids: ids,
        limit: options.pageSize,
        p: options.current,
        query: query,
      },
    }).then((res) => {
      return { list: res.dat.list, total: res.dat.total };
    });
  }
  return Promise.resolve({ list: [], total: 0 });
}

const index = (_props: any) => {
  const { t, i18n } = useTranslation('common');
  const history = useHistory();
  const [query, setQuery] = useState(() => sessionStorage.getItem(SEARCH_SESSION_KEY) || '');
  const { busiGroups, businessGroup } = useContext(CommonStateContext);
  const [selectedIds, setSelectedIds] = useState([] as any[]);
  const [gids, setGids] = useState<string | undefined>(getDefaultGids(N9E_GIDS_LOCALKEY, businessGroup));
  useEffect(() => {
    sessionStorage.setItem(SEARCH_SESSION_KEY, query);
  }, [query]);

  const { tableProps, refresh } = useAntdTable<any, any>((options) => getTableData(options, gids, query), {
    refreshDeps: [gids, query],
    debounceWait: 300,
  });

  function handleTagClick(tag: string) {
    if (!_.includes(query, tag)) {
      const newQuery = query ? `${query} ${tag}` : tag;
      setQuery(newQuery);
    }
  }

  function handleBatchBindTags() {
    if (!_.isEmpty(selectedIds)) {
      BindTags({
        language: i18n.language,
        selectedIds,
        busiId: businessGroup.id,
        onOk: () => {
          refresh();
        },
      });
    }
  }

  function handleBatchUnBindTags() {
    if (!_.isEmpty(selectedIds)) {
      let uniqueTags = [] as any[];
      _.each(tableProps.dataSource, (item) => {
        const tags = item.tags;
        uniqueTags = _.union(uniqueTags, tags);
      });
      UnBindTags({
        language: i18n.language,
        selectedIds,
        uniqueTags,
        busiId: businessGroup.id,
        onOk: () => {
          refresh();
        },
      });
    }
  }

  const showBusinessGroup = !(businessGroup.isLeaf && gids !== '-2');
  const columns: ColumnProps<Tpl>[] = _.concat(
    [
      {
        title: t('tpl.title'),
        dataIndex: 'title',
        width: 360,
        render: (text, record) => {
          const groupName = _.find(busiGroups, { id: record.group_id })?.name;
          return (
            <div className='flex flex-col gap-0.5'>
              <Link to={{ pathname: `/job-tpls/${record.id}/detail` }}>{text}</Link>
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
      {
        title: t('tpl.tags'),
        dataIndex: 'tags',
        width: 280,
        render: (text) => {
          return <Tags type='outline' maxWidth={180} data={text} onTagClick={handleTagClick} />;
        },
      },
      {
        title: t('tpl.creator'),
        dataIndex: 'create_by',
        width: 120,
        render: (val, record: any) => (
          <div>
            <div>{val}</div>
            {record.create_by_nickname && <div className='text-soft'>{record.create_by_nickname}</div>}
          </div>
        ),
      },
      {
        title: t('tpl.last_updated'),
        dataIndex: 'update_at',
        width: 180,
        render: (text) => {
          const m = moment.unix(text);
          return (
            <div>
              <div>{m.format('YYYY-MM-DD')}</div>
              <div>{m.format('HH:mm:ss')}</div>
            </div>
          );
        },
      },
      {
        title: t('table.operations'),
        width: 90,
        fixed: 'right' as const,
        render: (_text, record) => {
          return (
            <TableActionCell>
              <TableActionIconButton
                actionIcon='run'
                title={t('task.create')}
                onClick={() => {
                  history.push({ pathname: `/job-tpls/add/task`, search: `tpl=${record.id}` });
                }}
              />
              <Dropdown
                trigger={['click']}
                align={{ points: ['tr', 'tl'], offset: [-2, 0] }}
                overlayClassName='fc-table-action-dropdown'
                overlay={
                  <Menu>
                    <Menu.Item>
                      <TableActionLink actionIcon='edit' to={{ pathname: `/job-tpls/${record.id}/modify` }}>
                        {t('common:btn.edit')}
                      </TableActionLink>
                    </Menu.Item>
                    <Menu.Item>
                      <TableActionLink actionIcon='copy' to={{ pathname: `/job-tpls/${record.id}/clone` }}>
                        {t('common:btn.clone')}
                      </TableActionLink>
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item>
                      <TableActionButton
                        actionIcon='delete'
                        danger
                        onClick={() => {
                          Modal.confirm({
                            title: t('common:confirm.delete'),
                            onOk: () => {
                              return request(`${api.tasktpl(record.group_id)}/${record.id}`, {
                                method: 'DELETE',
                              }).then(() => {
                                message.success(t('msg.delete.success'));
                                refresh();
                              });
                            },
                          });
                        }}
                      >
                        {t('common:btn.delete')}
                      </TableActionButton>
                    </Menu.Item>
                  </Menu>
                }
              >
                <TableActionTrigger />
              </Dropdown>
            </TableActionCell>
          );
        },
      },
    ],
  );

  return (
    <PageLayout
      icon={<CodeOutlined />}
      title={<Space>{t('tpl')}</Space>}
      doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/self-healing/self-healing-script/'
    >
      <div style={{ display: 'flex' }}>
        <BusinessGroupSideBarWithAll gids={gids} setGids={setGids} localeKey={N9E_GIDS_LOCALKEY} allOptionLabel={t('common:tpl.allOptionLabel')} />
        {gids ? (
          <div className='fc-border rounded-lg p-4' style={{ flex: 1, minWidth: 0 }}>
            <Row>
              <Col span={14} className='mb-2'>
                <SearchInput
                  className='w-[200px]'
                  value={query}
                  onSearch={(val) => {
                    setQuery(val);
                  }}
                  allowClear
                />
              </Col>
              {businessGroup.isLeaf && gids !== '-2' && (
                <Col span={10} className='textAlignRight'>
                  <Link to={{ pathname: `/job-tpls/add` }}>
                    <Button style={{ marginRight: 10 }} type='primary'>
                      {t('tpl.create')}
                    </Button>
                  </Link>
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item>
                          <Button
                            type='link'
                            disabled={selectedIds.length === 0}
                            onClick={() => {
                              handleBatchBindTags();
                            }}
                          >
                            {t('tpl.tag.bind')}
                          </Button>
                        </Menu.Item>
                        <Menu.Item>
                          <Button
                            type='link'
                            disabled={selectedIds.length === 0}
                            onClick={() => {
                              handleBatchUnBindTags();
                            }}
                          >
                            {t('tpl.tag.unbind')}
                          </Button>
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <Button icon={<DownOutlined />}>{t('btn.batch_operations')}</Button>
                  </Dropdown>
                </Col>
              )}
            </Row>
            <Table
              className='mt-2'
              size='small'
              rowKey='id'
              columns={columns}
              {...(tableProps as any)}
              rowSelection={{
                selectedRowKeys: selectedIds,
                onChange: (selectedRowKeys) => {
                  setSelectedIds(selectedRowKeys);
                },
              }}
              pagination={
                {
                  ...tableProps.pagination,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '15', '50', '100', '500', '1000'],
                  showTotal: (total) => {
                    return i18n.language == 'en' ? `Total ${total} items` : `共 ${total} 条`;
                  },
                } as any
              }
            />
          </div>
        ) : (
          <BlankBusinessPlaceholder text={t('tpl')} />
        )}
      </div>
    </PageLayout>
  );
};

export default index;
