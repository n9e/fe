import React, { useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import { SortColumn } from 'react-data-grid';
import { Drawer, Empty } from 'antd';
import { useTranslation } from 'react-i18next';

import { NAME_SPACE } from '../../constants';
import { Field } from '../../types';
import getColumnsFromFields from './utils/getColumnsFromFields';
import getFieldsFromTableData from './utils/getFieldsFromTableData';
import RDGTable from './components/Table';
import LogViewer from './components/LogViewer';
import { OptionsType, OnValueFilterParams } from './types';

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
  onValueFilter?: (parmas: OnValueFilterParams) => void;
  /** 排序反转回调 */
  onReverseChange?: (reverse: boolean) => void;
  onOpenOrganizeFieldsModal?: () => void;
}

function Table(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const { indexData, timeField, data, colWidths, tableColumnsWidthCacheKey, options, filterFields, onValueFilter, onReverseChange, onOpenOrganizeFieldsModal } = props;
  const fields = useMemo(() => {
    const resolvedFields = getFieldsFromTableData(data);
    return filterFields ? filterFields(resolvedFields) : resolvedFields;
  }, [data, filterFields]);

  const indexDataFields = useMemo(() => _.map(indexData, 'field'), [indexData]);
  const columnDeps = useDeepCompareWithRef({ indexData: indexDataFields, fields, timeField, options, colWidths, data, tableColumnsWidthCacheKey });
  const [logViewerDrawerState, setLogViewerDrawerState] = useState<{ visible: boolean; value: any }>({ visible: false, value: null });
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
        setLogViewerDrawerState,
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
    <>
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
          type: 'drawer',
          onExpandIconClick: (row) => {
            setLogViewerDrawerState({ visible: true, value: _.omit(row, ['__expanded', '__id', '__type']) });
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
      <Drawer
        title={t('log_viewer_drawer_title')}
        placement='right'
        width='80%'
        onClose={() => {
          setLogViewerDrawerState({ visible: false, value: null });
        }}
        visible={logViewerDrawerState.visible}
        destroyOnClose
      >
        {logViewerDrawerState.value ? (
          <LogViewer
            value={logViewerDrawerState.value}
            rawValue={logViewerDrawerState.value}
            onValueFilter={
              onValueFilter
                ? (params) => {
                    onValueFilter(params);
                    setLogViewerDrawerState({ visible: false, value: null });
                  }
                : undefined
            }
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Drawer>
    </>
  );
}

export default React.memo(Table, (prevProps, nextProps) => {
  const pickKeys = ['logsHash', 'options', 'timeField', 'filterFields'];
  return _.isEqual(_.pick(prevProps, pickKeys), _.pick(nextProps, pickKeys));
});
