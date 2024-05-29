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
import { useAntdTable, useDebounceFn } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { Space, Table, Button, Input, Dropdown, Select, message, Modal, Tooltip, Menu } from 'antd';
import { DownOutlined, SearchOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons';
import { ColumnType } from 'antd/lib/table';
import usePagination from '@/components/usePagination';
import RefreshIcon from '@/components/RefreshIcon';
import OrganizeColumns, { getDefaultColumnsConfigs, setDefaultColumnsConfigs, ajustColumns } from '@/components/OrganizeColumns';
import { getUnitLabel, buildUnitOptions } from '@/pages/dashboard/Components/UnitPicker/utils';
import { getMenuPerm } from '@/services/common';
import { getMetrics, Record, Filter, getCollectors, deleteMetrics } from '@/pages/metricsBuiltin/services';
import Markdown from '@/components/Markdown';
import { defaultColumnsConfigs, LOCAL_STORAGE_KEY } from './constants';
import FormModal from './components/FormModal';
import Export from '@/pages/metricsBuiltin/components/Export';
import Import from '@/pages/metricsBuiltin/components/Import';

interface Props {
  component: string;
}

const FILTER_LOCAL_STORAGE_KEY = 'metricsBuiltin-filter';

export default function index(props: Props) {
  const { component } = props;
  const { t, i18n } = useTranslation('metricsBuiltin');
  const pagination = usePagination({ PAGESIZE_KEY: 'metricsBuiltin-pagesize' });
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refreshFlag_'));
  const [selectedRows, setSelectedRows] = useState<Record[]>([]);
  let defaultFilter = {} as Filter;
  try {
    defaultFilter = JSON.parse(window.localStorage.getItem(FILTER_LOCAL_STORAGE_KEY) || '{}');
  } catch (e) {
    console.error(e);
  }
  const [filter, setFilter] = useState(defaultFilter as Filter);
  const [queryValue, setQueryValue] = useState(defaultFilter.query || '');
  const [collectorsList, setCollectorsList] = useState<string[]>([]);
  const [columnsConfigs, setColumnsConfigs] = useState<{ name: string; visible: boolean }[]>(getDefaultColumnsConfigs(defaultColumnsConfigs, LOCAL_STORAGE_KEY));
  const [actionAuth, setActionAuth] = useState({
    add: false,
    edit: false,
    delete: false,
  });
  const { tableProps, run: fetchData } = useAntdTable(
    ({
      current,
      pageSize,
    }): Promise<{
      total: number;
      list: Record[];
    }> => {
      return getMetrics({ ...filter, typ: component, limit: pageSize, p: current });
    },
    {
      refreshDeps: [refreshFlag, JSON.stringify(filter), component, i18n.language],
      defaultPageSize: pagination.pageSize,
    },
  );
  let columns: (ColumnType<Record> & { RC_TABLE_INTERNAL_COL_DEFINE?: any })[] = [
    {
      title: t('collector'),
      dataIndex: 'collector',
    },
    {
      title: t('name'),
      dataIndex: 'name',
      render: (value, record) => {
        return (
          <Tooltip overlayClassName='ant-tooltip-max-width-600 ant-tooltip-with-link' title={record.note ? <Markdown content={record.note} /> : undefined}>
            <span>{value}</span>
          </Tooltip>
        );
      },
    },
    {
      title: t('unit'),
      dataIndex: 'unit',
      render: (val) => {
        return (
          <Tooltip overlayClassName='built-in-metrics-table-unit-option-desc' title={getUnitLabel(val, true, true)}>
            <span>{getUnitLabel(val, false)}</span>
          </Tooltip>
        );
      },
    },
    {
      title: t('expression'),
      dataIndex: 'expression',
      render: (val) => {
        const splitArr = _.split(val, '\n');
        return _.map(splitArr, (item, index) => {
          return (
            <div
              key={index}
              style={{
                wordBreak: 'break-all',
              }}
            >
              {item}
              {index !== splitArr.length - 1 && <br />}
            </div>
          );
        });
      },
    },
    {
      title: t('note'),
      dataIndex: 'note',
    },
    {
      title: t('common:table.operations'),
      dataIndex: 'operator',
      render: (data, record: any) => {
        return (
          <Dropdown
            overlay={
              <Menu>
                {actionAuth.add && (
                  <Menu.Item>
                    <FormModal
                      component={component}
                      mode='clone'
                      initialValues={record}
                      title={t('clone_title')}
                      collectorsList={collectorsList}
                      onOk={() => {
                        setRefreshFlag(_.uniqueId('refreshFlag_'));
                      }}
                    >
                      <a>{t('common:btn.clone')}</a>
                    </FormModal>
                  </Menu.Item>
                )}
                {actionAuth.edit && (
                  <Menu.Item>
                    <FormModal
                      component={component}
                      mode='edit'
                      initialValues={record}
                      title={t('edit_title')}
                      collectorsList={collectorsList}
                      onOk={() => {
                        setRefreshFlag(_.uniqueId('refreshFlag_'));
                      }}
                    >
                      <a>{t('common:btn.edit')}</a>
                    </FormModal>
                  </Menu.Item>
                )}
                {actionAuth.delete && (
                  <Menu.Item>
                    <Button
                      danger
                      type='link'
                      className='p0 height-auto'
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
  ];

  if (!actionAuth.add && !actionAuth.edit && !actionAuth.delete) {
    columns = _.filter(columns, (column) => column.dataIndex !== 'operator');
  }

  const { run: queryChange } = useDebounceFn(
    (query) => {
      const newFilter = { ...filter, query };
      setFilter(newFilter);
      window.localStorage.setItem(FILTER_LOCAL_STORAGE_KEY, JSON.stringify(newFilter));
    },
    {
      wait: 500,
    },
  );

  useEffect(() => {
    getCollectors().then((res) => {
      setCollectorsList(res);
    });
    getMenuPerm().then((res) => {
      const { dat } = res;
      setActionAuth({
        add: _.includes(dat, '/builtin-metrics/add'),
        edit: _.includes(dat, '/builtin-metrics/put'),
        delete: _.includes(dat, '/builtin-metrics/del'),
      });
    });
  }, []);

  return (
    <>
      <div
        className='mb8'
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Space>
          <RefreshIcon
            onClick={() => {
              fetchData({ current: tableProps.pagination.current, pageSize: pagination.pageSize });
            }}
          />
          <Select
            value={filter.collector}
            onChange={(val) => {
              const newFilter = { ...filter, collector: val };
              setFilter(newFilter);
              window.localStorage.setItem(FILTER_LOCAL_STORAGE_KEY, JSON.stringify(newFilter));
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
            style={{ width: 140 }}
            allowClear
            dropdownMatchSelectWidth={false}
          />
          <Select
            value={filter.unit}
            onChange={(val) => {
              const newFilter = { ...filter, unit: val };
              setFilter(newFilter);
              window.localStorage.setItem(FILTER_LOCAL_STORAGE_KEY, JSON.stringify(newFilter));
            }}
            options={buildUnitOptions()}
            showSearch
            optionFilterProp='label'
            placeholder={t('unit')}
            style={{ width: 140 }}
            allowClear
            dropdownMatchSelectWidth={false}
            optionLabelProp='cleanLabel'
            mode='multiple'
            maxTagCount='responsive'
          />
          <Input
            placeholder={t('common:search_placeholder')}
            style={{ width: 200 }}
            value={queryValue}
            onChange={(e) => {
              setQueryValue(e.target.value);
              queryChange(e.target.value);
            }}
            prefix={<SearchOutlined />}
          />
        </Space>
        <Space>
          {actionAuth.add && (
            <FormModal
              component={component}
              mode='add'
              title={t('add_btn')}
              collectorsList={collectorsList}
              onOk={() => {
                setRefreshFlag(_.uniqueId('refreshFlag_'));
              }}
            >
              <Button type='primary'>{t('add_btn')}</Button>
            </FormModal>
          )}
          {(actionAuth.add || actionAuth.delete) && (
            <Dropdown
              overlay={
                <ul className='ant-dropdown-menu'>
                  {actionAuth.add && (
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
                      <span>{t('batch.import.title')}</span>
                    </li>
                  )}
                  {actionAuth.add && (
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
                      <span>{t('batch.export.title')}</span>
                    </li>
                  )}
                  {actionAuth.delete && (
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
                  )}
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
          )}
          <Button
            onClick={() => {
              OrganizeColumns({
                i18nNs: 'metricsBuiltin',
                value: columnsConfigs,
                onChange: (val) => {
                  setColumnsConfigs(val);
                  setDefaultColumnsConfigs(val, LOCAL_STORAGE_KEY);
                },
              });
            }}
            icon={<EyeOutlined />}
          />
        </Space>
      </div>
      <Table
        className='mt8'
        size='small'
        rowKey='id'
        {...tableProps}
        columns={ajustColumns(columns, columnsConfigs)}
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
    </>
  );
}
