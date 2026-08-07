import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import i18next from 'i18next';
import { Space, Tooltip } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import { Field } from '../../../types';
import LogFieldValue from '../components/LogFieldValue';
import { OptionsType, OnValueFilterParams, FieldValueType } from '../types';

export default function getColumnsFromFields(params: {
  id_key: string;
  colWidths?: { [key: string]: number };
  indexData?: Field[];
  fields: string[];
  timeField?: string;
  options?: OptionsType;
  onValueFilter?: (parmas: OnValueFilterParams) => void;
  data?: any[];
  highlights?: {
    [key: string]: string[];
  }[];
  tableColumnsWidthCacheKey?: string;
  onOpenOrganizeFieldsModal?: () => void;
  setLogViewerDrawerState?: React.Dispatch<React.SetStateAction<{ visible: boolean; currentIndex: number }>>;
  timeColumnWidth?: number;
  timeFieldColumnFormat?: (timeFieldValue: string | number) => React.ReactNode;
  linesColumnFormat?: (linesValue: number) => React.ReactNode;
  adjustFieldValue?: (formatedValue: FieldValueType, highlightValue?: string[]) => React.ReactNode;
  showExistsAction?: boolean;
}) {
  const {
    id_key,
    colWidths,
    indexData,
    fields,
    timeField: time_field,
    options,
    onValueFilter,
    data,
    highlights,
    tableColumnsWidthCacheKey,
    onOpenOrganizeFieldsModal,
    setLogViewerDrawerState,
    timeColumnWidth = 140,
    timeFieldColumnFormat,
    linesColumnFormat,
    adjustFieldValue,
    showExistsAction,
  } = params;

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

  // P0-6: 预构建 id → index 映射，避免每个单元格 formatter 里 O(n) 反查行号（整表 O(行²×列)）
  const rowIndexMap = new Map<string | number, number>();
  if (data) {
    _.forEach(data, (row, idx) => {
      rowIndexMap.set(row[id_key], idx);
    });
  }
  const getRowIndex = (row: { [key: string]: any }) => {
    if (!data) return -1;
    const idx = rowIndexMap.get(row[id_key]);
    return idx === undefined ? -1 : idx;
  };

  const columns: any[] = _.map(fields, (item) => {
    const organizeFields = options?.organizeFields || [];
    const iconsWidth = _.includes(organizeFields, item) ? 0 : 20; // 预留图标宽度
    let realName = item;
    if (indexData && !_.find(indexData, { field: item })) {
      const firstPart = item.split('.')[0];
      if (_.find(indexData, { field: firstPart })) {
        realName = firstPart;
      }
    }
    const width = tableColumnsWidthCacheValue[item];
    const baseWidth = iconsWidth + 20;
    const minWidth = 60;

    return {
      minWidth,
      width: (width ? width : colWidths?.[item] || minWidth) + baseWidth,
      key: item,
      headerCellClass: 'group',
      name: (
        <Space>
          {item}
          {onOpenOrganizeFieldsModal && (
            <PlusCircleOutlined
              className='invisible group-hover:visible'
              onClick={() => {
                onOpenOrganizeFieldsModal();
              }}
            />
          )}
        </Space>
      ),
      formatter: (params) => {
        const record = params.row;
        const idx = getRowIndex(params.row);
        const highlight = highlights?.[idx] || {};
        let fieldValue = record[item];

        // 对象和数组类型的字段值进行字符串化展示
        if (_.isPlainObject(fieldValue) || _.isArray(fieldValue)) {
          fieldValue = JSON.stringify(fieldValue);
        }

        return (
          <div className='max-h-[140px]'>
            {/* 即使当前数据源不支持添加筛选条件，也需保留字段值组件提供的下钻链接和操作菜单。 */}
            <LogFieldValue
              enableTooltip
              name={item}
              value={fieldValue}
              onTokenClick={onValueFilter}
              rawValue={record}
              highlight={highlight}
              adjustFieldValue={adjustFieldValue}
              showExistsAction={showExistsAction}
            />
          </div>
        );
      },
    };
  });
  if (time_field && options?.time === 'true') {
    columns.unshift({
      name: i18next.t('log_explorer:logs.settings.time'),
      key: '___time___',
      width: timeColumnWidth,
      sortable: true,
      resizable: false,
      formatter: ({ row }) => {
        const idx = getRowIndex(row);
        return (
          <Tooltip title={i18next.t('log_explorer:log_viewer_drawer_trigger_tip')}>
            <div
              className='cursor-pointer'
              onClick={() => {
                setLogViewerDrawerState?.({ visible: true, currentIndex: idx });
              }}
            >
              {timeFieldColumnFormat ? timeFieldColumnFormat(row[time_field]) : moment(row[time_field]).format('MM-DD HH:mm:ss.SSS')}
            </div>
          </Tooltip>
        );
      },
    });
  }
  if (options?.lines === 'true') {
    columns.unshift({
      name: i18next.t('log_explorer:logs.settings.lines'),
      key: '___lines___',
      width: 40,
      resizable: false,
      formatter: ({ row }) => {
        const idx = getRowIndex(row);
        return (
          <Tooltip title={i18next.t('log_explorer:log_viewer_drawer_trigger_tip')}>
            <div
              className='cursor-pointer'
              onClick={() => {
                setLogViewerDrawerState?.({ visible: true, currentIndex: idx });
              }}
            >
              {linesColumnFormat ? linesColumnFormat(idx + 1) : idx + 1}
            </div>
          </Tooltip>
        );
      },
    });
  }
  return columns;
}
