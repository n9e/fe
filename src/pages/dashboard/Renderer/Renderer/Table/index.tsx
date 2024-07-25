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
import React, { useRef, useEffect, useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import _ from 'lodash';
import { Table, Input, Space, Button } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import type { FilterConfirmProps } from 'antd/es/table/interface';
import { useSize } from 'ahooks';
import { useAntdResizableHeader } from '@fc-components/use-antd-resizable-header';
import '@fc-components/use-antd-resizable-header/dist/style.css';
import { useTranslation } from 'react-i18next';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { IPanel } from '../../../types';
import getCalculatedValuesBySeries, { getSerieTextObj, getMappedTextObj } from '../../utils/getCalculatedValuesBySeries';
import getOverridePropertiesByName from '../../utils/getOverridePropertiesByName';
import localeCompare from '../../utils/localeCompare';
import formatToTable from '../../utils/formatToTable';
import { useGlobalState } from '../../../globalState';
import { getDetailUrl } from '../../utils/replaceExpressionDetail';
import { transformColumns, downloadCsv, useDeepCompareWithRef, isRawData } from './utils';
import Cell from './Cell';
import './style.less';
import moment from 'moment';

interface IProps {
  values: IPanel;
  series: any[];
  themeMode?: 'dark';
  time: IRawTimeRange;
  isPreview?: boolean;
}

const DEFAULT_LIGTH_COLOR = '#ffffff';
const DEFAULT_DARK_COLOR = '#333';
const LIMIT = 500;

const getColumnsKeys = (data: any[]) => {
  const keys = _.reduce(
    data,
    (result, item) => {
      return _.union(result, _.keys(item.metric));
    },
    [],
  );
  return _.uniq(keys);
};
const getSortOrder = (key, sortObj) => {
  return sortObj.sortColumn === key ? sortObj.sortOrder : false;
};
const getColor = (color, colorMode, themeMode) => {
  if (themeMode === 'dark') {
    if (colorMode === 'background') {
      return {
        color: DEFAULT_LIGTH_COLOR,
        backgroundColor: color || 'unset',
      };
    }
    return {
      color: color || DEFAULT_LIGTH_COLOR,
      backgroundColor: 'unset',
    };
  } else {
    if (colorMode === 'background') {
      return {
        color: color ? DEFAULT_LIGTH_COLOR : color,
        backgroundColor: color || 'unset',
      };
    }
    return {
      color: color || DEFAULT_DARK_COLOR,
      backgroundColor: 'unset',
    };
  }
};

function TableCpt(props: IProps, ref: any) {
  const { t } = useTranslation('dashboard');
  const [dashboardMeta] = useGlobalState('dashboardMeta');
  const eleRef = useRef<HTMLDivElement>(null);
  const size = useSize(eleRef);
  const { values, themeMode, time, isPreview } = props;
  const series = _.slice(props.series, 0, LIMIT);
  const { custom, options, overrides } = values;
  const { showHeader, calc, aggrDimension, displayMode, columns, sortColumn, sortOrder, colorMode = 'value', tableLayout = 'fixed' } = custom;
  const [calculatedValues, setCalculatedValues] = useState<any[]>([]);
  const [sortObj, setSortObj] = useState({
    sortColumn,
    sortOrder,
  });
  const [tableFields, setTableFields] = useGlobalState('tableFields');
  const [displayedTableFields, setDisplayedTableFields] = useGlobalState('displayedTableFields');
  const [tableRefIds, setTableRefIds] = useGlobalState('tableRefIds');
  const isAppendLinkColumn = !_.isEmpty(custom.links) && custom.linkMode !== 'cellLink';

  useEffect(() => {
    setSortObj({
      sortColumn,
      sortOrder,
    });
  }, [sortColumn, sortOrder]);

  useEffect(() => {
    const data = getCalculatedValuesBySeries(
      series,
      calc,
      {
        unit: options?.standardOptions?.util,
        decimals: options?.standardOptions?.decimals,
        dateFormat: options?.standardOptions?.dateFormat,
      },
      options?.valueMappings,
    );
    let fields: string[] = [];
    if (displayMode === 'seriesToRows') {
      fields = ['name', 'value'];
    } else if (displayMode === 'labelsOfSeriesToRows') {
      fields = !_.isEmpty(columns) ? columns : isRawData(series) ? getColumnsKeys(data) : [...getColumnsKeys(data), 'value'];
    } else if (displayMode === 'labelValuesToRows') {
      fields = _.isArray(aggrDimension) ? aggrDimension : [aggrDimension];
    }
    const aggrDimensions = _.isArray(aggrDimension) ? aggrDimension : [aggrDimension];
    const tableDataSource = formatToTable(data, aggrDimensions, 'refId');
    const groupNames = _.reduce(
      tableDataSource,
      (pre, item) => {
        return _.union(_.concat(pre, item.groupNames));
      },
      [],
    );
    if (isPreview) {
      setTableRefIds(groupNames);
      setDisplayedTableFields(fields);
      setTableFields(getColumnsKeys(data));
    }
    setCalculatedValues(data);
  }, [isPreview, useDeepCompareWithRef(series), calc, useDeepCompareWithRef(options), displayMode, aggrDimension, useDeepCompareWithRef(columns)]);

  const searchInput = useRef<any>(null);
  const handleSearch = (confirm: (param?: FilterConfirmProps) => void) => {
    confirm();
  };
  const handleReset = (clearFilters: () => void, confirm: (param?: FilterConfirmProps) => void) => {
    clearFilters();
    confirm();
  };
  const getColumnSearchProps = (names: string[]): ColumnType<any> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(confirm)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button type='primary' onClick={() => handleSearch(confirm)} icon={<SearchOutlined />} size='small' style={{ width: 90 }}>
            Search
          </Button>
          <Button onClick={() => clearFilters && handleReset(clearFilters, confirm)} size='small' style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => <FilterOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      const fieldVal = _.get(record, names);
      if (typeof fieldVal === 'string' || _.isArray(fieldVal)) {
        return fieldVal
          .toString()
          .toLowerCase()
          .includes((value as string).toLowerCase());
      }
      return true;
    },
  });

  let tableDataSource = calculatedValues;
  let tableColumns: any[] = [];
  if (!_.isEmpty(calculatedValues) && size?.width && size?.height) {
    const timeColWidth = calc === 'origin' ? 180 : 0;
    tableColumns = [
      {
        title: 'name',
        dataIndex: 'name',
        key: 'name',
        width: size?.width! - (isAppendLinkColumn ? 240 + timeColWidth : 120 + timeColWidth),
        sorter: (a, b) => {
          return localeCompare(a.name, b.name);
        },
        sortOrder: getSortOrder('name', sortObj),
        render: (text, record) => {
          const textObj = getMappedTextObj(text, options?.valueMappings);
          return <Cell {...textObj} panel={values} time={time} record={record} />;
        },
        ...getColumnSearchProps(['name']),
      },
      {
        title: 'value',
        dataIndex: 'value',
        key: 'value',
        sorter: (a, b) => {
          return a.stat - b.stat;
        },
        sortOrder: getSortOrder('value', sortObj),
        className: 'renderer-table-td-content-value-container',
        render: (_val, record) => {
          let textObj = {
            text: record.text,
            color: record.color,
          };
          const overrideProps = getOverridePropertiesByName(overrides, 'byFrameRefID', record.fields?.refId);
          if (!_.isEmpty(overrideProps)) {
            textObj = getSerieTextObj(record?.stat, overrideProps?.standardOptions, overrideProps?.valueMappings);
          }
          const colorObj = getColor(textObj.color, colorMode, themeMode);
          return <Cell {...textObj} style={colorObj} panel={values} time={time} record={record} />;
        },
        ...getColumnSearchProps(['text']),
      },
    ];
    if (calc === 'origin') {
      tableColumns = _.concat(
        {
          title: '__time__',
          key: 'name',
          dataIndex: '__time__',
          sorter: (a, b) => {
            return localeCompare(a.__time__, b.__time__);
          },
          sortOrder: getSortOrder('__time__', sortObj),
          render: (text, record) => {
            const textObj = getMappedTextObj(moment.unix(text).format('YYYY-MM-DD HH:mm:ss'), options?.valueMappings);
            return <Cell {...textObj} panel={values} time={time} record={record} />;
          },
          ...getColumnSearchProps(['__time__']),
        },
        tableColumns,
      );
    }

    if (displayMode === 'labelsOfSeriesToRows') {
      const columnsKeys: any[] = _.isEmpty(columns) ? (isRawData(series) ? getColumnsKeys(calculatedValues) : _.concat(getColumnsKeys(calculatedValues), 'value')) : columns;
      tableColumns = _.map(columnsKeys, (key, idx) => {
        return {
          title: key,
          dataIndex: key,
          key: key,
          width: tableLayout === 'fixed' ? (idx < columnsKeys.length - 1 ? size?.width! / columnsKeys.length - 14 : undefined) : 150,
          ellipsis: true,
          sorter: (a, b) => {
            if (key === 'value') {
              return a.stat - b.stat;
            }
            return localeCompare(_.get(a.metric, key), _.get(b.metric, key));
          },
          sortOrder: getSortOrder(key, sortObj),
          className: key === 'value' ? 'renderer-table-td-content-value-container' : '',
          render: (_val, record) => {
            if (key === 'value') {
              let textObj = {
                text: record?.text,
                color: record.color,
              };
              const overrideProps = getOverridePropertiesByName(overrides, 'byFrameRefID', record.fields?.refId);
              if (!_.isEmpty(overrideProps)) {
                textObj = getSerieTextObj(record?.stat, overrideProps?.standardOptions, overrideProps?.valueMappings);
              }
              const colorObj = getColor(textObj.color, colorMode, themeMode);
              return <Cell {...textObj} style={colorObj} panel={values} time={time} record={record} />;
            }
            let text = record.metric?.[key] || record.fields?.[key]; // TODO metric or fields
            if (key === '__time__') {
              text = moment.unix(text).format('YYYY-MM-DD HH:mm:ss');
            }
            let textObj = getMappedTextObj(text, options?.valueMappings);
            const overrideProps = getOverridePropertiesByName(overrides, 'byName', key);
            if (!_.isEmpty(overrideProps)) {
              textObj = getSerieTextObj(textObj.text, overrideProps?.standardOptions, overrideProps?.valueMappings);
            }
            return <Cell {...textObj} panel={values} time={time} record={record} />;
          },
          ...getColumnSearchProps(['metric', key]),
        };
      });
    }

    if (displayMode === 'labelValuesToRows' && aggrDimension) {
      const aggrDimensions = _.isArray(aggrDimension) ? aggrDimension : [aggrDimension];
      tableDataSource = formatToTable(calculatedValues, aggrDimensions, 'refId');
      const groupNames = _.reduce(
        tableDataSource,
        (pre, item) => {
          return _.union(_.concat(pre, item.groupNames));
        },
        [],
      );
      tableColumns = _.map(aggrDimensions, (aggrDimension) => {
        return {
          title: aggrDimension,
          dataIndex: aggrDimension,
          key: aggrDimension,
          width: tableLayout === 'fixed' ? size?.width! / (groupNames.length + aggrDimensions.length) - 14 : 150,
          sorter: (a, b) => {
            return localeCompare(a[aggrDimension], b[aggrDimension]);
          },
          sortOrder: getSortOrder(aggrDimension, sortObj),
          render: (text, record) => {
            if (aggrDimension === '__time__') {
              text = moment.unix(text).format('YYYY-MM-DD HH:mm:ss');
            }
            const textObj = getMappedTextObj(text, options?.valueMappings);
            return <Cell {...textObj} panel={values} time={time} record={record} />;
          },
          ...getColumnSearchProps([aggrDimension]),
        };
      });
      _.map(groupNames, (name, idx) => {
        const result = _.find(tableDataSource, (item) => {
          return item[name];
        });
        tableColumns.push({
          title: result[name]?.name,
          dataIndex: name,
          key: name,
          // TODO: 暂时关闭维度值列的伸缩，降低对目前不太理想的列伸缩交互的理解和操作成本
          width: tableLayout === 'fixed' ? (idx < groupNames.length - 1 ? size?.width! / (groupNames.length + aggrDimensions.length) - 14 : undefined) : 150,
          sorter: (a, b) => {
            return localeCompare(a[name]?.stat, b[name]?.stat);
          },
          sortOrder: getSortOrder(name, sortObj),
          className: 'renderer-table-td-content-value-container',
          render: (record) => {
            let textObj = {
              text: record?.text,
              color: record?.color,
            };
            const overrideProps = getOverridePropertiesByName(overrides, 'byFrameRefID', name);
            if (!_.isEmpty(overrideProps)) {
              textObj = getSerieTextObj(record?.stat, overrideProps?.standardOptions, overrideProps?.valueMappings);
            }
            const colorObj = getColor(textObj.color, colorMode, themeMode);
            return <Cell {...textObj} style={colorObj} panel={values} time={time} record={record} />;
          },
          ...getColumnSearchProps([name, 'text']),
        });
      });
    }

    if (isAppendLinkColumn) {
      tableColumns.push({
        title: t('panel.base.link.label'),
        render: (_val, record) => {
          return (
            <Space>
              {_.map(custom.links, (link, idx) => {
                const data = {
                  name: record.name,
                  value: record.value,
                  metric: record.metric,
                };
                if (displayMode === 'labelValuesToRows' && aggrDimension) {
                  data.metric = {};
                  _.forEach(getColumnsKeys(calculatedValues), (item) => {
                    data.metric[item] = record[item];
                  });
                }
                return (
                  <a key={idx} href={getDetailUrl(link.url, data, dashboardMeta, time)} target='_blank'>
                    {link.title}
                  </a>
                );
              })}
            </Space>
          );
        },
      });
    }
  }

  const headerHeight = showHeader ? 44 : 0;
  const height = size?.height! - headerHeight;
  const realHeight = isNaN(height) ? 0 : height;

  const { components, resizableColumns, tableWidth, resetColumns } = useAntdResizableHeader({
    columns: useMemo(() => {
      if (!_.isEmpty(calculatedValues) && !_.isEmpty(tableColumns)) {
        tableColumns = transformColumns(tableColumns, values.transformations);
      }
      return tableColumns;
    }, [useDeepCompareWithRef(columns), displayMode, useDeepCompareWithRef(calculatedValues), sortObj, themeMode, aggrDimension, overrides, size, tableLayout]),
    columnsState: {
      persistenceType: 'localStorage',
      persistenceKey: `dashboard-table2.1-resizable-${values.id}`,
    },
    cache: false,
  });

  useImperativeHandle(
    ref,
    () => {
      return {
        exportCsv() {
          let data: string[][] = _.map(tableDataSource, (item) => {
            return [item.name, item.value];
          });
          data.unshift(['name', 'value']);
          if (displayMode === 'labelsOfSeriesToRows') {
            const keys = _.isEmpty(columns) ? _.concat(getColumnsKeys(tableDataSource), 'value') : columns;
            data = _.map(tableDataSource, (item) => {
              return _.map(keys, (key) => {
                if (key === 'value') {
                  return _.get(item, key);
                }
                return _.get(item.metric, key);
              });
            });
            data.unshift(keys);
          }
          if (displayMode === 'labelValuesToRows' && aggrDimension) {
            const aggrDimensions = _.isArray(aggrDimension) ? aggrDimension : [aggrDimension];
            const groupNames = _.reduce(
              tableDataSource,
              (pre, item) => {
                return _.union(_.concat(pre, item.groupNames));
              },
              [],
            );
            data = _.map(tableDataSource, (item) => {
              const row = _.map(aggrDimensions, (key) => _.get(item, key));
              _.map(groupNames, (name) => {
                row.push(_.get(item, name)?.text);
              });
              return row;
            });
            data.unshift(
              _.concat(
                aggrDimensions,
                _.map(groupNames, (name) => _.get(tableDataSource[0], name)?.name),
              ),
            );
          }
          const organizeOptions = values.transformations?.[0]?.options;
          if (organizeOptions) {
            const { renameByName } = organizeOptions;
            if (renameByName) {
              data[0] = _.map(data[0], (item) => {
                const newName = renameByName[item];
                if (newName) {
                  return newName;
                }
                return item;
              });
            }
          }
          downloadCsv(data, values.name);
        },
      };
    },
    [useDeepCompareWithRef(tableDataSource), useDeepCompareWithRef(aggrDimension), displayMode, useDeepCompareWithRef(values.transformations), useDeepCompareWithRef(columns)],
  );

  return (
    <div className='renderer-table-container' ref={eleRef}>
      <div className='renderer-table-container-box'>
        <Table
          rowKey='id'
          size='small'
          getPopupContainer={() => document.body}
          showSorterTooltip={false}
          showHeader={showHeader}
          dataSource={tableDataSource}
          columns={_.map(resizableColumns, (item) => {
            return _.omit(item, ['ellipsis']);
          })}
          scroll={{ y: realHeight, x: tableWidth ? tableWidth - 30 : tableWidth }}
          bordered={false}
          pagination={false}
          onChange={(pagination, filters, sorter: any) => {
            setSortObj({
              sortColumn: sorter.columnKey,
              sortOrder: sorter.order,
            });
          }}
          components={components}
        />
      </div>
    </div>
  );
}

export default React.memo(forwardRef(TableCpt), (prevProps, nextProps) => {
  return _.isEqual(prevProps, nextProps);
});
