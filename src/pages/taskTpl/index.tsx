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
import { Modal, Row, Col, Button, Dropdown, Menu, message, Space } from 'antd';
import { DownOutlined, CodeOutlined } from '@ant-design/icons';
import { ColumnProps } from 'antd/lib/table';
import _ from 'lodash';
import { useAntdTable } from 'ahooks';
import { useTranslation } from 'react-i18next';

import EnhancedTable from '@/components/EnhancedTable';
import { tagsColumn, updateByColumn, dateColumn } from '@/components/EnhancedTable/columns';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import api from '@/utils/api';
import PageLayout from '@/components/pageLayout';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import EmptyGuide from '@/components/EmptyGuide';
import DocumentDrawer from '@/components/DocumentDrawer';
import { CommonStateContext } from '@/App';
import BusinessGroupSideBarWithAll, { getDefaultGids } from '@/components/BusinessGroup/BusinessGroupSideBarWithAll';
import SearchInput from '@/components/BaseSearchInput';
import usePagination from '@/components/usePagination';

import { Tpl } from './interface';
import BindTags from './bindTags';
import UnBindTags from './unBindTags';
import ScenarioList from './components/ScenarioList';
import TemplateLibrary from './components/TemplateLibrary';
import { DOC_URL, SCRIPT_TEMPLATES_ENABLED } from './constants';

const N9E_GIDS_LOCALKEY = 'N9E_TASK_TPL_NODE_ID';
const SEARCH_SESSION_KEY = 'taskTpl_query';
const PAGE_SESSION_KEY = 'taskTpl_page';

function getTableData(options: any, gids: string | undefined, query: string) {
  if (gids) {
    const ids = gids === '-2' ? undefined : gids;
    sessionStorage.setItem(PAGE_SESSION_KEY, String(options.current));
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
  const { t: tsh } = useTranslation('alertSelfHealing');
  const history = useHistory();
  const { darkMode } = useContext(CommonStateContext);
  const [query, setQuery] = useState(() => sessionStorage.getItem(SEARCH_SESSION_KEY) || '');
  const { busiGroups, businessGroup } = useContext(CommonStateContext);
  const [selectedIds, setSelectedIds] = useState([] as any[]);
  const [templateVisible, setTemplateVisible] = useState(false);
  const [gids, setGids] = useState<string | undefined>(getDefaultGids(N9E_GIDS_LOCALKEY, businessGroup));
  useEffect(() => {
    sessionStorage.setItem(SEARCH_SESSION_KEY, query);
  }, [query]);

  const defaultPage = Number(sessionStorage.getItem(PAGE_SESSION_KEY) || '1');
  const { tableProps, refresh } = useAntdTable<any, any>((options) => getTableData(options, gids, query), {
    refreshDeps: [gids, query],
    debounceWait: 300,
    defaultParams: [{ current: defaultPage, pageSize: 10 }],
  });
  const pagination = usePagination({ PAGESIZE_KEY: 'job-tpls' });

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
      // 候选标签只取「被选中的行」的并集：只能解绑选中脚本上真实存在的标签
      const selectedRows = _.filter(tableProps.dataSource, (item: any) => _.includes(selectedIds, item.id));
      _.each(selectedRows, (item) => {
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
              <Link to={{ pathname: `/job-tpls/${record.id}/detail`, search: `gid=${record.group_id}` }}>{text}</Link>
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
      tagsColumn({ title: t('tpl.tags'), dataIndex: 'tags', maxWidth: 180, onTagClick: handleTagClick }),
      updateByColumn({ title: t('common:table.update_by'), dataIndex: 'update_by', nickname: 'update_by_nickname' }),
      dateColumn({ title: t('common:table.update_at'), dataIndex: 'update_at', unix: true }),
    ] as any,
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
          <div className='fc-border rounded-lg p-4' style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
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
                  {SCRIPT_TEMPLATES_ENABLED && (
                    <Button style={{ marginRight: 10 }} onClick={() => setTemplateVisible(true)}>
                      {tsh('templates.entry_btn')}
                    </Button>
                  )}
                  <Link to={{ pathname: `/job-tpls/add`, search: `gid=${gids}` }}>
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
            <EnhancedTable
              className='mt-2'
              size='small'
              rowKey='id'
              columns={columns}
              rowActions={(record) => ({
                inline: [
                  {
                    key: 'create',
                    text: t('task.create'),
                    onClick: () => history.push({ pathname: `/job-tpls/add/task`, search: `tpl=${record.id}&gid=${record.group_id}` }),
                  },
                  {
                    key: 'edit',
                    icon: 'edit',
                    text: t('common:btn.edit'),
                    onClick: () => history.push({ pathname: `/job-tpls/${record.id}/modify`, search: `gid=${record.group_id}` }),
                  },
                  {
                    key: 'clone',
                    icon: 'copy',
                    text: t('common:btn.clone'),
                    onClick: () => history.push({ pathname: `/job-tpls/${record.id}/clone`, search: `gid=${record.group_id}` }),
                  },
                  {
                    key: 'delete',
                    icon: 'delete',
                    text: t('common:btn.delete'),
                    danger: true,
                    onClick: () => {
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
                    },
                  },
                ],
              })}
              actionColumn={{ title: t('table.operations'), width: 130 }}
              {...(tableProps as any)}
              locale={{
                // 仅在「确实一条脚本都没有 + 无搜索 + 可创建」时给引导，搜索无结果时回退默认空态
                emptyText:
                  businessGroup.isLeaf && gids !== '-2' && !query && _.isEmpty(tableProps.dataSource) ? (
                    <EmptyGuide
                      title={tsh('empty_guide.title')}
                      descriptionClassName='max-w-[620px]'
                      description={
                        <>
                          <div className='mb-1'>{tsh('empty_guide.desc_title')}</div>
                          <ScenarioList />
                        </>
                      }
                      actions={
                        <>
                          <Button type='primary' onClick={() => history.push({ pathname: '/job-tpls/add', search: `gid=${gids}` })}>
                            {t('tpl.create')}
                          </Button>
                          {SCRIPT_TEMPLATES_ENABLED && <Button onClick={() => setTemplateVisible(true)}>{tsh('templates.entry_btn')}</Button>}
                          <a onClick={() => DocumentDrawer({ language: i18n.language, darkMode, title: t('common:page_help'), type: 'iframe', documentPath: DOC_URL })}>
                            {tsh('empty_guide.doc')}
                          </a>
                        </>
                      }
                    />
                  ) : undefined,
              }}
              rowSelection={{
                selectedRowKeys: selectedIds,
                onChange: (selectedRowKeys) => {
                  setSelectedIds(selectedRowKeys);
                },
              }}
              pagination={{
                ...pagination,
                ...tableProps.pagination,
              }}
            />
          </div>
        ) : (
          <BlankBusinessPlaceholder text={t('tpl')} />
        )}
      </div>
      {SCRIPT_TEMPLATES_ENABLED && <TemplateLibrary visible={templateVisible} onClose={() => setTemplateVisible(false)} gid={gids} />}
    </PageLayout>
  );
};

export default index;
