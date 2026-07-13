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
import { Space, Button, Input, Dropdown, Select, message, Modal, Tooltip, Tag } from 'antd';
import { DownOutlined, SearchOutlined } from '@ant-design/icons';
import { Copy, Pencil } from 'lucide-react';
import { ColumnType } from 'antd/lib/table';
import usePagination from '@/components/usePagination';
import EnhancedTable from '@/components/EnhancedTable';
import { updateByColumn } from '@/components/EnhancedTable/columns';
import EllipsisText from '@/components/EllipsisText';
import RefreshIcon from '@/components/RefreshIcon';
import TableColumnSelect, { getDefaultColumnsConfigs, setDefaultColumnsConfigs, buildColumnOptions } from '@/components/TableColumnSelect';
import { getUnitLabel, buildUnitOptions } from '@/pages/dashboard/Components/UnitPicker/utils';
import { getMenuPerm } from '@/services/common';
import { getMetrics, Record, Filter, getCollectors, deleteMetrics } from '@/pages/metricsBuiltin/services';
import Markdown from '@/components/Markdown';
import { defaultColumnsConfigs, LOCAL_STORAGE_KEY } from './constants';
import FormModal from './components/FormModal';
import Export from '@/pages/metricsBuiltin/components/Export';
import Import from '@/pages/metricsBuiltin/components/Import';
import { HelpLink } from '@/components/pageLayout';

interface Props {
  component: string;
}

const FILTER_SESSION_STORAGE_KEY = 'metricsBuiltin-filter';

export default function index(props: Props) {
  const { component } = props;
  const { t, i18n } = useTranslation('metricsBuiltin');
  const pagination = usePagination({ PAGESIZE_KEY: 'metricsBuiltin-pagesize' });
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refreshFlag_'));
  const [selectedRows, setSelectedRows] = useState<Record[]>([]);
  let defaultFilter = {} as Filter;
  try {
    defaultFilter = JSON.parse(window.localStorage.getItem(FILTER_SESSION_STORAGE_KEY) || '{}');
  } catch (e) {
    console.error(e);
  }
  const [filter, setFilter] = useState(defaultFilter as Filter);
  const [queryValue, setQueryValue] = useState(defaultFilter.query || '');
  const [collectorsList, setCollectorsList] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => getDefaultColumnsConfigs(defaultColumnsConfigs, LOCAL_STORAGE_KEY));
  const columnOptions = buildColumnOptions(defaultColumnsConfigs, t);
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
  const columns: (ColumnType<Record> & { RC_TABLE_INTERNAL_COL_DEFINE?: any })[] = [
    {
      title: t('collector'),
      dataIndex: 'collector',
    },
    {
      title: t('name'),
      dataIndex: 'name',
      render: (value, record) => {
        return (
          <Tooltip overlayClassName='ant-tooltip-max-width-600 ant-tooltip-with-link' title={record.note ? <Markdown content={record.note} inTooltip /> : undefined}>
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
      ellipsis: { showTitle: false },
      render: (val) => <EllipsisText text={val} />,
    },
    updateByColumn({
      title: t('common:table.update_by'),
      dataIndex: 'updated_by',
      key: 'updated_by',
      filterMode: 'none',
      render: (value) => {
        if (!value) return '-';
        if (value === 'system') {
          return <Tag>{t('builtInComponents:payload_by_system')}</Tag>;
        }
        return value;
      },
    }),
  ];

  const { run: queryChange } = useDebounceFn(
    (query) => {
      const newFilter = { ...filter, query };
      setFilter(newFilter);
      window.localStorage.setItem(FILTER_SESSION_STORAGE_KEY, JSON.stringify(newFilter));
    },
    {
      wait: 500,
    },
  );

  useEffect(() => {
    getCollectors({
      typ: component,
    }).then((res) => {
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
        className='mb-2'
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
              window.localStorage.setItem(FILTER_SESSION_STORAGE_KEY, JSON.stringify(newFilter));
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
              window.localStorage.setItem(FILTER_SESSION_STORAGE_KEY, JSON.stringify(newFilter));
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
          <HelpLink src='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/integrations/templates/built-in-metric-template/' />
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
              <Button type='primary'>{t('common:btn.create')}</Button>
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
          <TableColumnSelect
            options={columnOptions}
            value={visibleColumns}
            onChange={(vals) => {
              setVisibleColumns(vals);
              setDefaultColumnsConfigs(vals, LOCAL_STORAGE_KEY);
            }}
            sortable={false}
            showAll
            buttonSize='middle'
          />
        </Space>
      </div>
      <EnhancedTable
        className='mt-2'
        size='small'
        rowKey='id'
        {...tableProps}
        columns={columns.filter((col) => {
          if (col.dataIndex === 'operator') return true;
          return visibleColumns.includes(col.dataIndex as string);
        })}
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
        rowActions={(record: any) => {
          if (!actionAuth.add && !actionAuth.edit && !actionAuth.delete) return undefined;
          return {
            menu: _.compact([
              actionAuth.add
                ? {
                    key: 'clone',
                    node: (
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
                        <Button type='link' className='fc-table-action-menu-btn' icon={<Copy className='fc-table-action-menu-icon' />}>
                          {t('common:btn.clone')}
                        </Button>
                      </FormModal>
                    ),
                  }
                : undefined,
              actionAuth.edit && record.updated_by !== 'system'
                ? {
                    key: 'edit',
                    node: (
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
                        <Button type='link' className='fc-table-action-menu-btn' icon={<Pencil className='fc-table-action-menu-icon' />}>
                          {t('common:btn.edit')}
                        </Button>
                      </FormModal>
                    ),
                  }
                : undefined,
              actionAuth.delete && record.updated_by !== 'system'
                ? {
                    key: 'delete',
                    icon: 'delete',
                    text: t('common:btn.delete'),
                    danger: true,
                    onClick: () => {
                      Modal.confirm({
                        title: t('common:confirm.delete'),
                        onOk() {
                          deleteMetrics([record.id]).then(() => {
                            message.success(t('common:success.delete'));
                            setRefreshFlag(_.uniqueId('refreshFlag_'));
                          });
                        },
                      });
                    },
                  }
                : undefined,
            ]) as any,
          };
        }}
        actionColumn={{ title: t('common:table.operations'), width: 64 }}
      />
    </>
  );
}
