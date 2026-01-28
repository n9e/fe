import React, { useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import { SortColumn } from 'react-data-grid';
import { Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { useClickAway } from 'ahooks';
import moment from 'moment';

import NavigableDrawer from '@/components/NavigableDrawer';

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
  id_key: string;
  raw_key: string;
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
  timeFieldColumnFormat?: (timeFieldValue: string | number) => React.ReactNode;
  linesColumnFormat?: (linesValue: number) => React.ReactNode;
  logViewerExtraRender?: (log: { [index: string]: any }) => React.ReactNode;
}

function Table(props: Props) {
  const { t } = useTranslation(NAME_SPACE);
  const {
    id_key,
    raw_key,
    indexData,
    timeField,
    data,
    logsHash,
    colWidths,
    tableColumnsWidthCacheKey,
    options,
    filterFields,
    onValueFilter,
    onReverseChange,
    onOpenOrganizeFieldsModal,
    timeFieldColumnFormat,
    linesColumnFormat,
    logViewerExtraRender,
  } = props;
  const fields = useMemo(() => {
    const resolvedFields = getFieldsFromTableData(data);
    return filterFields ? filterFields(resolvedFields) : resolvedFields;
  }, [data, filterFields]);

  const indexDataFields = useMemo(() => _.map(indexData, 'field'), [indexData]);
  const columnDeps = useDeepCompareWithRef({ indexData: indexDataFields, fields, timeField, options, colWidths, data, tableColumnsWidthCacheKey });
  const [logViewerDrawerState, setLogViewerDrawerState] = useState<{ visible: boolean; currentIndex: number }>({ visible: false, currentIndex: -1 });

  const columns = useMemo(
    () =>
      getColumnsFromFields({
        id_key,
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
        timeFieldColumnFormat,
        linesColumnFormat,
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

  const navigableDrawerTitle = useMemo(() => {
    if (timeField) {
      const logItem = data[logViewerDrawerState.currentIndex];
      if (logItem && logItem[timeField]) {
        return timeFieldColumnFormat ? timeFieldColumnFormat(logItem[timeField]) : moment(logItem[timeField]).format('MM-DD HH:mm:ss.SSS');
      }
    }
    return t('log_viewer_drawer_title');
  }, [logsHash, timeField, logViewerDrawerState]);

  const drawerRef = useRef<HTMLDivElement>(null);

  useClickAway(
    (event) => {
      // 忽略点击发生在 log viewer drawer 内的情况
      const target = (event && (event as Event).target) as HTMLElement | null;
      if (target && typeof target.closest === 'function' && target.closest('.log-explorer-log-viewer-drawer')) {
        return;
      }
      // 只有当 Drawer 打开时才尝试关闭
      if (logViewerDrawerState.currentIndex > -1) {
        setLogViewerDrawerState({ visible: false, currentIndex: -1 });
      }
    },
    [drawerRef],
    ['click'],
  );

  return (
    <div className='min-h-0 h-full' ref={drawerRef}>
      <RDGTable
        className='n9e-event-logs-table'
        rowKeyGetter={(row) => {
          return row[id_key];
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
            const idx = _.findIndex(data, { [id_key]: row[id_key] });
            setLogViewerDrawerState({ visible: true, currentIndex: idx });
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
      <NavigableDrawer
        className='log-explorer-log-viewer-drawer'
        title={navigableDrawerTitle}
        extra={logViewerExtraRender && logViewerExtraRender(data[logViewerDrawerState.currentIndex])}
        placement='right'
        width='55%'
        onClose={() => {
          setLogViewerDrawerState({ visible: false, currentIndex: -1 });
        }}
        hasPrev={logViewerDrawerState.currentIndex > 0}
        hasNext={logViewerDrawerState.currentIndex !== -1 && logViewerDrawerState.currentIndex < data.length - 1}
        onPrev={() => {
          setLogViewerDrawerState({ visible: true, currentIndex: logViewerDrawerState.currentIndex - 1 });
        }}
        onNext={() => {
          setLogViewerDrawerState({ visible: true, currentIndex: logViewerDrawerState.currentIndex + 1 });
        }}
        visible={logViewerDrawerState.visible}
        destroyOnClose
      >
        {logViewerDrawerState.currentIndex > -1 ? (
          <LogViewer
            id_key={id_key}
            raw_key={raw_key}
            value={data[logViewerDrawerState.currentIndex]}
            rawValue={data[logViewerDrawerState.currentIndex]}
            onValueFilter={(params) => {
              onValueFilter?.(params);
              setLogViewerDrawerState({ visible: false, currentIndex: -1 });
            }}
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </NavigableDrawer>
    </div>
  );
}

export default React.memo(Table, (prevProps, nextProps) => {
  const pickKeys = ['logsHash', 'options', 'timeField', 'filterFields'];
  return _.isEqual(_.pick(prevProps, pickKeys), _.pick(nextProps, pickKeys));
});
