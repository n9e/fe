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
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useAntdTable } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { Space, Table, Button, Input, Dropdown, Select, message, Modal } from 'antd';
import { SettingOutlined, DownOutlined } from '@ant-design/icons';
import { ColumnType } from 'antd/lib/table';
import PageLayout from '@/components/pageLayout';
import usePagination from '@/components/usePagination';
import { getMetrics, Record, Filter, getTypes, getCollectors, deleteMetrics } from './services';
import FormDrawer from './components/FormDrawer';
import Export from './components/Export';
import Import from './components/Import';

export default function index() {
  const { t } = useTranslation('metricsBuiltin');
  const pagination = usePagination({ PAGESIZE_KEY: 'metricsBuiltin-pagesize' });
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refreshFlag_'));
  const [selectedRows, setSelectedRows] = useState<Record[]>([]);
  const [filter, setFilter] = useState({} as Filter);
  const [typesList, setTypesList] = useState<string[]>([]);
  const [collectorsList, setCollectorsList] = useState<string[]>([]);
  const { tableProps } = useAntdTable(
    ({
      current,
      pageSize,
    }): Promise<{
      total: number;
      list: Record[];
    }> => {
      return getMetrics({ ...filter, limit: pageSize, p: current });
    },
    {
      refreshDeps: [refreshFlag, JSON.stringify(filter)],
      defaultPageSize: pagination.pageSize,
      debounceWait: 500,
    },
  );
  const columns: (ColumnType<Record> & { RC_TABLE_INTERNAL_COL_DEFINE?: any })[] = [
    {
      title: t('name'),
      dataIndex: 'name',
    },
    {
      title: t('collector'),
      dataIndex: 'collector',
    },
    {
      title: t('typ'),
      dataIndex: 'typ',
      RC_TABLE_INTERNAL_COL_DEFINE: {
        style: {
          minWidth: 70,
        },
      },
    },
    {
      title: t('unit'),
      dataIndex: 'unit',
    },
    {
      title: t('note'),
      dataIndex: 'note',
      width: 600,
    },
    {
      title: t('common:table.operations'),
      dataIndex: 'operator',
      width: 120,
      render: (data, record: any) => {
        return (
          <Space>
            <FormDrawer
              mode='clone'
              initialValues={record}
              title={t('clone_title')}
              typesList={typesList}
              collectorsList={collectorsList}
              onOk={() => {
                setRefreshFlag(_.uniqueId('refreshFlag_'));
              }}
            >
              <a>{t('common:btn.clone')}</a>
            </FormDrawer>
            <FormDrawer
              mode='edit'
              initialValues={record}
              title={t('edit_title')}
              typesList={typesList}
              collectorsList={collectorsList}
              onOk={() => {
                setRefreshFlag(_.uniqueId('refreshFlag_'));
              }}
            >
              <a>{t('common:btn.edit')}</a>
            </FormDrawer>
            <Button
              danger
              type='link'
              style={{ padding: 0 }}
              onClick={() => {
                Modal.confirm({
                  title: t('common:confirm.delete'),
                  onOk() {
                    deleteMetrics([record.id]).then(() => {
                      message.success(t('common:success.delete'));
                      setRefreshFlag(_.uniqueId('refreshFlag_'));
                    });
                  },
                });
              }}
            >
              {t('common:btn.delete')}
            </Button>
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    getTypes().then((res) => {
      setTypesList(res);
    });
    getCollectors().then((res) => {
      setCollectorsList(res);
    });
  }, []);

  return (
    <PageLayout title={t('title')} icon={<SettingOutlined />}>
      <div>
        <div
          className='n9e-border-base'
          style={{
            padding: 16,
          }}
        >
          <div
            className='mb8'
            style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <Space>
              <Select
                value={filter.typ}
                onChange={(val) => {
                  setFilter({ ...filter, typ: val });
                }}
                options={_.map(typesList, (item) => {
                  return {
                    label: item,
                    value: item,
                  };
                })}
                showSearch
                optionFilterProp='label'
                placeholder={t('typ')}
                style={{ width: 200 }}
                allowClear
              />
              <Select
                value={filter.collector}
                onChange={(val) => {
                  setFilter({ ...filter, collector: val });
                }}
                options={_.map(collectorsList, (item) => {
                  return {
                    label: item,
                    value: item,
                  };
                })}
                showSearch
                optionFilterProp='label'
                placeholder={t('collector')}
                style={{ width: 200 }}
                allowClear
              />
              <Input
                placeholder={t('common:search_placeholder')}
                style={{ width: 300 }}
                value={filter.query}
                onChange={(e) => {
                  setFilter({ ...filter, query: e.target.value });
                }}
              />
            </Space>
            <Space>
              <FormDrawer
                mode='add'
                title={t('add_btn')}
                typesList={typesList}
                collectorsList={collectorsList}
                onOk={() => {
                  setRefreshFlag(_.uniqueId('refreshFlag_'));
                }}
              >
                <Button type='primary'>{t('add_btn')}</Button>
              </FormDrawer>
              <Dropdown
                overlay={
                  <ul className='ant-dropdown-menu'>
                    <li
                      className='ant-dropdown-menu-item'
                      onClick={() => {
                        Import({
                          onOk: () => {
                            setRefreshFlag(_.uniqueId('refreshFlag_'));
                          },
                        });
                      }}
                    >
                      <span>{t('collect-tpls:batch.import.title')}</span>
                    </li>
                    <li
                      className='ant-dropdown-menu-item'
                      onClick={() => {
                        if (selectedRows.length) {
                          Export({
                            data: JSON.stringify(
                              _.map(selectedRows, (item) => {
                                return _.omit(item, ['id', 'created_at', 'created_by', 'updated_at', 'updated_by']);
                              }),
                              null,
                              2,
                            ),
                          });
                        } else {
                          message.warning(t('batch.not_select'));
                        }
                      }}
                    >
                      <span>{t('collect-tpls:batch.export.title')}</span>
                    </li>
                    <li
                      className='ant-dropdown-menu-item'
                      onClick={() => {
                        if (selectedRows.length) {
                          Modal.confirm({
                            title: t('common:confirm.delete'),
                            onOk() {
                              deleteMetrics(_.map(selectedRows, (item) => item.id)).then(() => {
                                message.success(t('common:success.delete'));
                                setRefreshFlag(_.uniqueId('refreshFlag_'));
                              });
                            },
                          });
                        } else {
                          message.warning(t('batch.not_select'));
                        }
                      }}
                    >
                      <span>{t('common:btn.batch_delete')}</span>
                    </li>
                  </ul>
                }
                trigger={['click']}
              >
                <Button onClick={(e) => e.stopPropagation()}>
                  {t('common:btn.more')}
                  <DownOutlined
                    style={{
                      marginLeft: 2,
                    }}
                  />
                </Button>
              </Dropdown>
            </Space>
          </div>
          <Table
            className='mt8'
            size='small'
            rowKey='id'
            {...tableProps}
            columns={columns}
            pagination={{
              ...pagination,
              ...tableProps.pagination,
            }}
            rowSelection={{
              selectedRowKeys: _.map(selectedRows, (item) => item.id),
              onChange: (_selectedRowKeys: React.Key[], selectedRows: Record[]) => {
                setSelectedRows(selectedRows);
              },
            }}
          />
        </div>
      </div>
    </PageLayout>
  );
}
