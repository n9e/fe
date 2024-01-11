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
import React, { useState, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Table, Divider, Popconfirm, Tag, Row, Col, Input, Button, Dropdown, Menu, message } from 'antd';
import { DownOutlined, SearchOutlined, CodeOutlined } from '@ant-design/icons';
import { ColumnProps } from 'antd/lib/table';
import _ from 'lodash';
import moment from 'moment';
import { useAntdTable } from 'ahooks';
import { useTranslation } from 'react-i18next';
import request from '@/utils/request';
import api from '@/utils/api';
import BusinessGroup from '@/components/BusinessGroup';
import PageLayout from '@/components/pageLayout';
import { Tpl } from './interface';
import BindTags from './bindTags';
import UnBindTags from './unBindTags';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import { CommonStateContext } from '@/App';

function getTableData(options: any, gids: string | undefined, query: string) {
  if (gids) {
    return request(`/api/n9e/busi-groups/task-tpls?gids=${gids}&limit=${options.pageSize}&p=${options.current}&query=${query}`).then((res) => {
      return { list: res.dat.list, total: res.dat.total };
    });
  }
  return Promise.resolve({ list: [], total: 0 });
}

const index = (_props: any) => {
  const { t, i18n } = useTranslation('common');
  const searchRef = useRef<any>(null);
  const [query, setQuery] = useState('');
  const { busiGroups, businessGroup } = useContext(CommonStateContext);
  const [selectedIds, setSelectedIds] = useState([] as any[]);
  const { tableProps, refresh } = useAntdTable<any, any>((options) => getTableData(options, businessGroup.ids, query), { refreshDeps: [businessGroup.ids, query] });

  function handleTagClick(tag: string) {
    if (!_.includes(query, tag)) {
      const newQuery = query ? `${query} ${tag}` : tag;
      setQuery(newQuery);
      searchRef.current?.setValue(newQuery);
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

  const columns: ColumnProps<Tpl>[] = _.concat(
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
      },
      {
        title: t('tpl.title'),
        dataIndex: 'title',
        render: (text, record) => {
          return <Link to={{ pathname: `/job-tpls/${record.id}/detail` }}>{text}</Link>;
        },
      },
      {
        title: t('tpl.tags'),
        dataIndex: 'tags',
        render: (text) => {
          return _.map(text, (item) => (
            <Tag color='purple' key={item} onClick={() => handleTagClick(item)}>
              {item}
            </Tag>
          ));
        },
      },
      {
        title: t('tpl.creator'),
        dataIndex: 'create_by',
        width: 100,
      },
      {
        title: t('tpl.last_updated'),
        dataIndex: 'update_at',
        width: 160,
        render: (text) => {
          return moment.unix(text).format('YYYY-MM-DD HH:mm:ss');
        },
      },
      {
        title: t('table.operations'),
        width: 220,
        render: (_text, record) => {
          return (
            <span>
              <Link to={{ pathname: `/job-tpls/add/task`, search: `tpl=${record.id}` }}>{t('task.create')}</Link>
              <Divider type='vertical' />
              <Link to={{ pathname: `/job-tpls/${record.id}/modify` }}>{t('common:btn.edit')}</Link>
              <Divider type='vertical' />
              <Link to={{ pathname: `/job-tpls/${record.id}/clone` }}>{t('common:btn.clone')}</Link>
              <Divider type='vertical' />
              <Popconfirm
                title={<div style={{ width: 100 }}>{t('common:confirm.delete')}</div>}
                onConfirm={() => {
                  request(`${api.tasktpl(record.group_id)}/${record.id}`, {
                    method: 'DELETE',
                  }).then(() => {
                    message.success(t('msg.delete.success'));
                    refresh();
                  });
                }}
              >
                <a style={{ color: 'red' }}>{t('common:btn.delete')}</a>
              </Popconfirm>
            </span>
          );
        },
      },
    ],
  );
  return (
    <PageLayout
      title={
        <>
          <CodeOutlined />
          {t('tpl')}
        </>
      }
    >
      <div style={{ display: 'flex' }}>
        <BusinessGroup />
        {businessGroup.ids ? (
          <div style={{ flex: 1, padding: 10 }}>
            <Row>
              <Col span={14} className='mb10'>
                <Input
                  style={{ width: 200 }}
                  ref={searchRef}
                  prefix={<SearchOutlined />}
                  defaultValue={query}
                  onPressEnter={(e) => {
                    setQuery(e.currentTarget.value);
                  }}
                />
              </Col>
              {businessGroup.isLeaf && (
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
              className='mt8'
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
                  pageSizeOptions: ['10', '50', '100', '500', '1000'],
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
