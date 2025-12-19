import React, { useMemo, useRef } from 'react';
import { Table as AntdTable } from 'antd';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useAntdResizableHeader } from '@fc-components/use-antd-resizable-header';
import '@fc-components/use-antd-resizable-header/dist/style.css';

import { Field } from '@/pages/explorer/components/FieldsList/types';

import getColumnsFromFields from './utils/getColumnsFromFields';
import toString from './utils/toString';
import getFieldsFromTableData from './utils/getFieldsFromTableData';
import FieldValueWithFilter from './components/FieldValueWithFilter';
import { OptionsType } from './types';

export function useDeepCompareWithRef(value) {
  const ref = useRef();
  if (!_.isEqual(value, ref.current)) {
    ref.current = value; //ref.current contains the previous object value
  }

  return ref.current;
}

interface Props {
  /** 索引数据 */
  indexData?: Field[];
  /** 时间字段 */
  timeField?: string;
  /** 日志数据 */
  data: {
    [index: string]: any;
  }[];
  logsHash?: string;
  colWidths?: { [key: string]: number };
  tableColumnsWidthCacheKey?: string;
  /** 日志格式配置项 */
  options?: OptionsType;
  updateOptions?: (options: OptionsType, reload?: boolean) => void;
  /** 表格滚动配置 */
  scroll?: { x: number | string; y: number | string };
  /** 过滤每行日志的字段，返回需要显示的字段数组 */
  filterFields?: (fieldKeys: string[]) => string[];
  /** 过滤每行日志的字段，返回需要显示的字段数组 */
  onValueFilter?: (parmas: { key: string; value: string; operator: 'AND' | 'NOT' }) => void;
}

function Table(props: Props) {
  const { indexData, timeField, data, colWidths, tableColumnsWidthCacheKey, options, updateOptions, scroll, filterFields, onValueFilter } = props;
  const fields = useMemo(() => {
    const resolvedFields = getFieldsFromTableData(data);
    return filterFields ? filterFields(resolvedFields) : resolvedFields;
  }, [data, filterFields]);

  const indexDataFields = useMemo(() => _.map(indexData, 'field'), [indexData]);
  const columnDeps = useDeepCompareWithRef({ indexData: indexDataFields, fields, timeField, options, colWidths });
  const columns = useMemo(
    () =>
      getColumnsFromFields({
        colWidths,
        indexData,
        fields,
        timeField,
        options,
        updateOptions,
        onValueFilter,
      }),
    [columnDeps, updateOptions, onValueFilter],
  );
  const resizableHeaderConfig = useMemo(() => {
    const config: any = {
      columns,
    };
    if (tableColumnsWidthCacheKey) {
      config.columnsState = {
        persistenceType: 'localStorage',
        persistenceKey: tableColumnsWidthCacheKey,
      };
    }
    return config;
  }, [tableColumnsWidthCacheKey]);

  const { components, resizableColumns, tableWidth } = useAntdResizableHeader(resizableHeaderConfig);

  return (
    <AntdTable
      className='n9e-event-logs-table'
      size='small'
      tableLayout='fixed'
      rowKey={(record) => {
        return _.join(
          _.map(record, (val) => val),
          '-',
        );
      }}
      columns={resizableColumns}
      components={components}
      dataSource={data}
      expandable={{
        expandedRowRender: (record) => {
          return (
            <div>
              {_.map(_.omit(record, ['___raw___', '___id___']), (val: any, key) => {
                return (
                  <dl key={key} className='mb-[4px]'>
                    <dt className='inline-block n9e-fill-color-4 px-[4px] py-[2px] mr-[4px] whitespace-nowrap'>{key}: </dt>
                    <dd className='inline'>{onValueFilter ? <FieldValueWithFilter name={key} value={toString(val)} onValueFilter={onValueFilter} /> : toString(val)}</dd>
                  </dl>
                );
              })}
            </div>
          );
        },
        expandIcon: ({ expanded, onExpand, record }) => (expanded ? <DownOutlined onClick={(e) => onExpand(record, e)} /> : <RightOutlined onClick={(e) => onExpand(record, e)} />),
      }}
      pagination={false}
      scroll={{
        ...scroll,
        x: tableWidth,
      }}
    />
  );
}

export default React.memo(Table, (prevProps, nextProps) => {
  const pickKeys = ['logsHash'];
  return _.isEqual(_.pick(prevProps, pickKeys), _.pick(nextProps, pickKeys));
});
