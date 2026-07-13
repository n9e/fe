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
import React, { useState, useEffect, useRef, useContext } from 'react';
import _ from 'lodash';
import { useAntdTable, useDebounceFn } from 'ahooks';
import { useTranslation } from 'react-i18next';
import { Space, Button, Input, Dropdown, Select, message, Modal, Tooltip, Tag } from 'antd';
import { SettingOutlined, DownOutlined, SearchOutlined } from '@ant-design/icons';
import { ColumnType } from 'antd/lib/table';

import { CommonStateContext } from '@/App';
import Markdown from '@/components/Markdown';
import PageLayout from '@/components/pageLayout';
import usePagination from '@/components/usePagination';
import EnhancedTable from '@/components/EnhancedTable';
import { updateByColumn } from '@/components/EnhancedTable/columns';
import EllipsisText from '@/components/EllipsisText';
import Tags from '@/components/TableTags/Tags';
import RefreshIcon from '@/components/RefreshIcon';
import TableColumnSelect, { getDefaultColumnsConfigs, setDefaultColumnsConfigs, buildColumnOptions } from '@/components/TableColumnSelect';
import { getUnitLabel, buildUnitOptions } from '@/pages/dashboard/Components/UnitPicker/utils';
import { getMenuPerm } from '@/services/common';
import Collapse from '@/pages/monitor/object/metricViews/components/Collapse';
import { getComponents, Component } from '@/pages/builtInComponents/services';
import { getDefaultDatasourceValue } from '@/utils';

import { getMetrics, Record, Filter, getTypes, getCollectors, deleteMetrics, buildLabelFilterAndExpression } from './services';
import { defaultColumnsConfigs, LOCAL_STORAGE_KEY } from './constants';
import FormDrawer from './components/FormDrawer';
import Export from './components/Export';
import Import from './components/Import';
import Filters, { filtersToStr } from './components/Filters';
import NewMetricExplorerDrawer from './components/NewMetricExplorerDrawer';
import ExplorerDrawer from './ExplorerDrawer';

export default function index() {
  const { t, i18n } = useTranslation('metricsBuiltin');
  const { groupedDatasourceList } = useContext(CommonStateContext);
  const pagination = usePagination({ PAGESIZE_KEY: 'metricsBuiltin-pagesize' });
  const [refreshFlag, setRefreshFlag] = useState(_.uniqueId('refreshFlag_'));
  const [selectedRows, setSelectedRows] = useState<Record[]>([]);
  let defaultFilter = {} as Filter;
  try {
    defaultFilter = JSON.parse(window.localStorage.getItem('metricsBuiltin-filter') || '{}');
  } catch (e) {
    console.error(e);
  }
  const [filter, setFilter] = useState(defaultFilter as Filter);
  const [queryValue, setQueryValue] = useState(defaultFilter.query || '');
  const [typesList, setTypesList] = useState<string[]>([]);
  const [collectorsList, setCollectorsList] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => getDefaultColumnsConfigs(defaultColumnsConfigs, LOCAL_STORAGE_KEY));
  const columnOptions = buildColumnOptions(defaultColumnsConfigs, t);
  const [explorerDrawerVisible, setExplorerDrawerVisible] = useState(false);
  const [explorerDrawerData, setExplorerDrawerData] = useState<Record>();
  const [actionAuth, setActionAuth] = useState({
    add: false,
    edit: false,
    delete: false,
  });
  const [typsMeta, setTypsMeta] = useState<Component[]>([]);
  const [formDrawerData, setFormDrawerData] = useState<{
    open?: boolean;
    title?: string;
    mode?: 'add' | 'edit' | 'clone';
    initialValues?: Record;
  }>();
  const [newMetricExplorerDrawerState, setNewMetricExplorerDrawerState] = useState<{
    visible: boolean;
    metric?: string;
    datasourceValue?: number;
  }>({
    visible: false,
    datasourceValue: getDefaultDatasourceValue('prometheus', groupedDatasourceList),
  });

  const filtersRef = useRef<any>(null);
  const { tableProps, run: fetchData } = useAntdTable(
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
      refreshDeps: [refreshFlag, JSON.stringify(filter), i18n.language],
      defaultPageSize: pagination.pageSize,
    },
  );
  const columns: (ColumnType<Record> & { RC_TABLE_INTERNAL_COL_DEFINE?: any })[] = [
    {
      title: t('typ'),
      dataIndex: 'typ',
      RC_TABLE_INTERNAL_COL_DEFINE: {
        style: {
          minWidth: 70,
        },
      },
      render: (val) => {
        return (
          <Space>
            <img src={_.find(typsMeta, (meta) => meta.ident === val)?.logo || '/image/default.png'} alt={val} style={{ width: 16, height: 16 }} />
            {val}
          </Space>
        );
      },
    },
    {
      title: t('collector'),
      dataIndex: 'collector',
    },
    {
      title: t('expression_type'),
      dataIndex: 'expression_type',
      render: (val) => {
        if (val === 'metric_name') {
          return t('expression_type_metric_name');
        }
        if (val === 'promql') {
          return t('expression_type_promql');
        }
        return val;
      },
    },
    {
      title: t('metric_type'),
      dataIndex: 'metric_type',
      render: (val) => {
        if (val === 'gauge') {
          return t('metric_type_gauge');
        }
        if (val === 'counter') {
          return t('metric_type_counter');
        }
        if (val === 'histogram') {
          return t('metric_type_histogram');
        }
        return val;
      },
    },
    {
      title: t('name'),
      dataIndex: 'name',
      render: (val, record) => {
        const recordClone = _.cloneDeep(record);
        return (
          <Tooltip overlayClassName='ant-tooltip-max-width-600 ant-tooltip-with-link' title={record.note ? <Markdown content={record.note} inTooltip /> : undefined}>
            <a
              onClick={() => {
                const curFilter = filtersRef.current?.getActive();
                let label_filter = '';
                try {
                  if (curFilter && curFilter.configs) {
                    label_filter = filtersToStr(JSON.parse(curFilter.configs));
                  }
                } catch (e) {
                  console.error(e);
                }
                if (label_filter) {
                  buildLabelFilterAndExpression({
                    label_filter,
                    promql: record.expression,
                  })
                    .then((res) => {
                      recordClone.expression = res;
                      setExplorerDrawerVisible(true);
                      setExplorerDrawerData(recordClone);
                    })
                    .catch(() => {
                      message.warning(t('filter.build_labelfilter_and_expression_error'));
                      setExplorerDrawerVisible(true);
                      setExplorerDrawerData(recordClone);
                    });
                } else {
                  setExplorerDrawerVisible(true);
                  setExplorerDrawerData(recordClone);
                }
              }}
            >
              {val}
            </a>
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
      title: t('extra_fields'),
      dataIndex: 'extra_fields',
      render: (val) => {
        return <Tags data={_.map(val, (item) => `${item.name}: ${item.value}`)} maxWidth={180} />;
      },
    },
    {
      title: t('note'),
      dataIndex: 'note',
      ellipsis: { showTitle: false },
      render: (value) => {
        return <EllipsisText text={value} />;
      },
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
      window.localStorage.setItem('metricsBuiltin-filter', JSON.stringify(newFilter));
    },
    {
      wait: 500,
    },
  );

  useEffect(() => {
    getComponents({
      disabled: 0,
    }).then((res) => {
      setTypsMeta(res);
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

  useEffect(() => {
    getTypes({
      disabled: 0,
    }).then((res) => {
      setTypesList(res);
    });
  }, []);

  useEffect(() => {
    getCollectors({
      typ: filter.typ,
    }).then((res) => {
      setCollectorsList(res);
    });
  }, [filter.typ]);

  return (
    <>
      <PageLayout
        title={t('title')}
        icon={<SettingOutlined />}
        doc='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/data-query/metrics/metrics-built-in/'
      >
        <div className='built-in-metrics-container'>
          <Collapse
            collapseLocalStorageKey='built-in-metrics-filters-collapse'
            widthLocalStorageKey='built-in-metrics-filters-width'
            defaultWidth={240}
            tooltip={t('filter.title')}
          >
            <div className='fc-border rounded-lg p-4 built-in-metrics-filter'>
              <Filters ref={filtersRef} />
            </div>
          </Collapse>
          <div className='fc-border rounded-lg p-4 built-in-metrics-main'>
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
                  value={filter.typ}
                  onChange={(val) => {
                    const newFilter = { ...filter, typ: val, collector: undefined };
                    setFilter(newFilter);
                    window.localStorage.setItem('metricsBuiltin-filter', JSON.stringify(newFilter));
                  }}
                  options={_.map(typesList, (item) => {
                    return {
                      label: (
                        <Space>
                          <img src={_.find(typsMeta, (meta) => meta.ident === item)?.logo || '/image/default.png'} alt={item} style={{ width: 16, height: 16 }} />
                          {item}
                        </Space>
                      ),
                      cleanLabel: item,
                      value: item,
                    };
                  })}
                  showSearch
                  optionFilterProp='cleanLabel'
                  placeholder={t('typ')}
                  style={{ width: 140 }}
                  allowClear
                  dropdownMatchSelectWidth={false}
                  optionLabelProp='cleanLabel'
                />
                <Select
                  value={filter.collector}
                  onChange={(val) => {
                    const newFilter = { ...filter, collector: val };
                    setFilter(newFilter);
                    window.localStorage.setItem('metricsBuiltin-filter', JSON.stringify(newFilter));
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
                    window.localStorage.setItem('metricsBuiltin-filter', JSON.stringify(newFilter));
                  }}
                  options={buildUnitOptions()}
                  showSearch
                  optionFilterProp='cleanLabel'
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
                  <Button
                    type='primary'
                    onClick={() => {
                      setFormDrawerData({
                        open: true,
                        mode: 'add',
                        title: t('add_btn'),
                      });
                    }}
                  >
                    {t('add_btn')}
                  </Button>
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
              rowActions={(record: any) => {
                if (!actionAuth.add && !actionAuth.edit && !actionAuth.delete) {
                  return undefined;
                }
                return {
                  menu: _.compact([
                    actionAuth.add
                      ? {
                          key: 'clone',
                          icon: 'copy' as const,
                          text: t('common:btn.clone'),
                          onClick: () => {
                            setFormDrawerData({
                              open: true,
                              mode: 'clone',
                              title: t('clone_title'),
                              initialValues: record,
                            });
                          },
                        }
                      : undefined,
                    actionAuth.edit && record.updated_by !== 'system'
                      ? {
                          key: 'edit',
                          icon: 'edit' as const,
                          text: t('common:btn.edit'),
                          onClick: () => {
                            setFormDrawerData({
                              open: true,
                              mode: 'edit',
                              title: t('edit_title'),
                              initialValues: record,
                            });
                          },
                        }
                      : undefined,
                    record.expression_type === 'metric_name'
                      ? {
                          key: 'laset_over_time',
                          icon: 'search' as const,
                          text: t('laset_over_time'),
                          onClick: () => {
                            setNewMetricExplorerDrawerState((prev) => {
                              return {
                                ...prev,
                                visible: true,
                                metric: `tlast_over_time(${record.expression}[7d:1m])`,
                              };
                            });
                          },
                        }
                      : undefined,
                    actionAuth.delete && record.updated_by !== 'system'
                      ? {
                          key: 'delete',
                          icon: 'delete' as const,
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
                  ]),
                };
              }}
              actionColumn={{ title: t('common:table.operations'), width: 64 }}
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
        <ExplorerDrawer
          visible={explorerDrawerVisible}
          onClose={() => {
            setExplorerDrawerVisible(false);
            setExplorerDrawerData(undefined);
          }}
          data={explorerDrawerData}
        />
        <FormDrawer
          open={formDrawerData?.open}
          onOpenChange={(open) => {
            setFormDrawerData({ ...(formDrawerData || {}), open });
          }}
          mode={formDrawerData?.mode}
          initialValues={formDrawerData?.initialValues}
          title={formDrawerData?.title}
          typesList={typesList}
          onOk={() => {
            setRefreshFlag(_.uniqueId('refreshFlag_'));
          }}
        />
      </PageLayout>
      <NewMetricExplorerDrawer
        visible={newMetricExplorerDrawerState.visible}
        onClose={() => {
          setNewMetricExplorerDrawerState({ visible: false, metric: undefined, datasourceValue: undefined });
        }}
        datasourceValue={newMetricExplorerDrawerState.datasourceValue}
        promql={newMetricExplorerDrawerState.metric}
      />
    </>
  );
}
