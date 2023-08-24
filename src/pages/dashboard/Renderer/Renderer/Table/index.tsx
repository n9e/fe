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
import React, { useRef, useEffect, useState, useMemo } from 'react';
import _ from 'lodash';
import { Table, Input, Space, Button } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import type { ColumnType } from 'antd/es/table';
import type { FilterConfirmProps } from 'antd/es/table/interface';
import { useSize } from 'ahooks';
import { useAntdResizableHeader } from '@minko-fe/use-antd-resizable-header';
import '@minko-fe/use-antd-resizable-header/dist/style.css';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { IPanel } from '../../../types';
import getCalculatedValuesBySeries, { getSerieTextObj } from '../../utils/getCalculatedValuesBySeries';
import getOverridePropertiesByName from '../../utils/getOverridePropertiesByName';
import localeCompare from '../../utils/localeCompare';
import formatToTable from '../../utils/formatToTable';
import { useGlobalState } from '../../../globalState';
import { getDetailUrl } from '../../utils/replaceExpressionDetail';
import { transformColumns } from './utils';
import './style.less';

interface IProps {
  values: IPanel;
  series: any[];
  themeMode?: 'dark';
  time: IRawTimeRange;
}

const DEFAULT_LIGTH_COLOR = '#ffffff';
const DEFAULT_DARK_COLOR = '#333';

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

export default function Stat(props: IProps) {
  const [dashboardMeta] = useGlobalState('dashboardMeta');
  const eleRef = useRef<HTMLDivElement>(null);
  const size = useSize(eleRef);
  const { values, series, themeMode, time } = props;
  const { custom, options, overrides } = values;
  const { showHeader, calc, aggrDimension, displayMode, columns, sortColumn, sortOrder, colorMode = 'value' } = custom;
  const [calculatedValues, setCalculatedValues] = useState<any[]>([]);
  const [sortObj, setSortObj] = useState({
    sortColumn,
    sortOrder,
  });
  const [tableFields, setTableFields] = useGlobalState('tableFields');
  const [displayedTableFields, setDisplayedTableFields] = useGlobalState('displayedTableFields');

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
      fields = !_.isEmpty(columns) ? columns : [...getColumnsKeys(data), 'value'];
    } else if (displayMode === 'labelValuesToRows') {
      fields = [aggrDimension];
    }
    setDisplayedTableFields(fields);
    setTableFields(getColumnsKeys(data));
    setCalculatedValues(data);
  }, [JSON.stringify(series), calc, JSON.stringify(options), displayMode, aggrDimension, JSON.stringify(columns)]);

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
  let tableColumns: any[] = [
    {
      title: 'name',
      dataIndex: 'name',
      key: 'name',
      width: size?.width! - 200,
      sorter: (a, b) => {
        return localeCompare(a.name, b.name);
      },
      sortOrder: getSortOrder('name', sortObj),
      render: (text) => <div className='renderer-table-td-content'>{text}</div>,
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
        const overrideProps = getOverridePropertiesByName(overrides, record.fields?.refId);
        if (!_.isEmpty(overrideProps)) {
          textObj = getSerieTextObj(record?.stat, overrideProps?.standardOptions, overrideProps?.valueMappings);
        }
        const colorObj = getColor(textObj.color, colorMode, themeMode);
        return (
          <div
            className='renderer-table-td-content'
            style={{
              ...colorObj,
            }}
          >
            {textObj.text}
          </div>
        );
      },
      ...getColumnSearchProps(['text']),
    },
  ];

  if (displayMode === 'labelsOfSeriesToRows') {
    const allColumns = _.concat(getColumnsKeys(calculatedValues), 'value');
    const columnsKeys: any[] = _.isEmpty(columns) ? _.concat(getColumnsKeys(calculatedValues), 'value') : columns;
    tableColumns = _.map(columnsKeys, (key, idx) => {
      return {
        title: key,
        dataIndex: key,
        key: key,
        width: idx < columnsKeys.length - 1 ? size?.width! / columnsKeys.length : undefined,
        sorter: (a, b) => {
          if (key === 'value') {
            return a.stat - b.stat;
          }
          return localeCompare(_.toString(_.get(a.metric, key)), _.toString(_.get(b.metric, key)));
        },
        sortOrder: getSortOrder(key, sortObj),
        className: key === 'value' ? 'renderer-table-td-content-value-container' : '',
        render: (_val, record) => {
          if (key === 'value') {
            let textObj = {
              text: record?.text,
              color: record.color,
            };
            const overrideProps = getOverridePropertiesByName(overrides, record.fields?.refId);
            if (!_.isEmpty(overrideProps)) {
              textObj = getSerieTextObj(record?.stat, overrideProps?.standardOptions, overrideProps?.valueMappings);
            }
            const colorObj = getColor(textObj.color, colorMode, themeMode);
            return (
              <div
                className='renderer-table-td-content'
                style={{
                  ...colorObj,
                }}
              >
                {textObj?.text}
              </div>
            );
          }
          return <span title={_.get(record.metric, key)}>{_.get(record.metric, key)}</span>;
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
        width: size?.width! / (groupNames.length + 1),
        sorter: (a, b) => {
          return localeCompare(a[aggrDimension], b[aggrDimension]);
        },
        sortOrder: getSortOrder(aggrDimension, sortObj),
        render: (text) => <div className='renderer-table-td-content'>{text}</div>,
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
        // width: idx < groupNames.length - 1 ? size?.width! / (groupNames.length + 1) : undefined,
        sorter: (a, b) => {
          return _.get(a[name], 'stat') - _.get(b[name], 'stat');
        },
        sortOrder: getSortOrder(name, sortObj),
        className: 'renderer-table-td-content-value-container',
        render: (record) => {
          let textObj = {
            text: record?.text,
            color: record?.color,
          };
          const overrideProps = getOverridePropertiesByName(overrides, name);
          if (!_.isEmpty(overrideProps)) {
            textObj = getSerieTextObj(record?.stat, overrideProps?.standardOptions, overrideProps?.valueMappings);
          }
          const colorObj = getColor(textObj.color, colorMode, themeMode);
          return (
            <div
              className='renderer-table-td-content'
              style={{
                ...colorObj,
              }}
            >
              {textObj?.text}
            </div>
          );
        },
        ...getColumnSearchProps([name, 'text']),
      });
    });
  }

  if (custom.links) {
    tableColumns.push({
      title: '链接',
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
                _.forEach(tableFields, (item) => {
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

  if (!_.isEmpty(calculatedValues) && !_.isEmpty(tableColumns)) {
    tableColumns = transformColumns(tableColumns, values.transformations);
  }

  const headerHeight = showHeader ? 44 : 0;
  const height = size?.height! - headerHeight;
  const realHeight = isNaN(height) ? 0 : height;

  const { components, resizableColumns, tableWidth, resetColumns } = useAntdResizableHeader({
    columns: useMemo(() => tableColumns, [JSON.stringify(columns), displayMode, JSON.stringify(calculatedValues), sortObj, themeMode, aggrDimension, overrides, size]),
    columnsState: {
      persistenceType: 'localStorage',
      persistenceKey: `dashboard-table-resizable-${values.id}`,
    },
  });

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
          columns={resizableColumns}
          scroll={{ y: realHeight, x: tableWidth }}
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
