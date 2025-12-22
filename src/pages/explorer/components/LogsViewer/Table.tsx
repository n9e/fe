import React, { useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import { SortColumn } from 'react-data-grid';
import RDGTable from './components/Table';

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
  /** 过滤每行日志的字段，返回需要显示的字段数组 */
  filterFields?: (fieldKeys: string[]) => string[];
  /** 过滤每行日志的字段，返回需要显示的字段数组 */
  onValueFilter?: (parmas: { key: string; value: string; operator: 'AND' | 'NOT' }) => void;
  /** 排序反转回调 */
  onReverseChange?: (reverse: boolean) => void;
  onOpenOrganizeFieldsModal?: () => void;
}

function Table(props: Props) {
  const { indexData, timeField, data, colWidths, tableColumnsWidthCacheKey, options, filterFields, onValueFilter, onReverseChange, onOpenOrganizeFieldsModal } = props;
  const fields = useMemo(() => {
    const resolvedFields = getFieldsFromTableData(data);
    return filterFields ? filterFields(resolvedFields) : resolvedFields;
  }, [data, filterFields]);

  const indexDataFields = useMemo(() => _.map(indexData, 'field'), [indexData]);
  const columnDeps = useDeepCompareWithRef({ indexData: indexDataFields, fields, timeField, options, colWidths, data, tableColumnsWidthCacheKey });
  const columns = useMemo(
    () =>
      getColumnsFromFields({
        colWidths,
        indexData,
        fields,
        timeField,
        options,
        onValueFilter,
        data,
        tableColumnsWidthCacheKey,
        onOpenOrganizeFieldsModal,
      }),
    [columnDeps, onValueFilter, onOpenOrganizeFieldsModal],
  );
  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>(
    timeField
      ? [
          {
            columnKey: '___time___',
            direction: 'DESC',
          },
        ]
      : [],
  );

  return (
    <RDGTable
      className='n9e-event-logs-table'
      rowKeyGetter={(row) => {
        return row.___id___;
      }}
      columns={columns}
      rows={data}
      sortColumns={sortColumns}
      onSortColumnsChange={(newSortColumns) => {
        let ajustedSortColumns = newSortColumns;
        if (newSortColumns.length === 0) {
          ajustedSortColumns = [{ columnKey: '___time___', direction: 'ASC' }];
        }
        if (timeField && onReverseChange) {
          onReverseChange(ajustedSortColumns[0].direction !== 'ASC');
        }
        setSortColumns(ajustedSortColumns);
      }}
      expandable={{
        expandedRowRender: (record) => {
          return (
            <div className='h-max leading-[14px]'>
              <div className='p-2'>
                {_.map(_.omit(record, ['___raw___', '___id___']), (val: any, key) => {
                  return (
                    <dl key={key} className='mb-[4px]'>
                      <dt className='inline-block n9e-fill-color-4 px-[4px] py-[2px] mr-[4px] whitespace-nowrap'>{key}: </dt>
                      <dd className='inline'>{onValueFilter ? <FieldValueWithFilter name={key} value={toString(val)} onValueFilter={onValueFilter} /> : toString(val)}</dd>
                    </dl>
                  );
                })}
              </div>
            </div>
          );
        },
      }}
      onColumnResize={(idx, width) => {
        if (!tableColumnsWidthCacheKey) return;
        const cloumnKey = columns[idx - 1]?.key;
        if (cloumnKey) {
          let tableColumnsWidthCacheValue: { [index: string]: number | undefined } = {};
          if (tableColumnsWidthCacheKey) {
            const cacheStr = localStorage.getItem(tableColumnsWidthCacheKey);
            if (cacheStr) {
              try {
                tableColumnsWidthCacheValue = JSON.parse(cacheStr);
              } catch (e) {
                console.warn('Parse table columns width cache value error', e);
              }
            }
          }
          tableColumnsWidthCacheValue[cloumnKey] = width;
          localStorage.setItem(tableColumnsWidthCacheKey, JSON.stringify(tableColumnsWidthCacheValue));
        }
      }}
    />
  );
}

export default React.memo(Table, (prevProps, nextProps) => {
  const pickKeys = ['logsHash', 'options'];
  return _.isEqual(_.pick(prevProps, pickKeys), _.pick(nextProps, pickKeys));
});
