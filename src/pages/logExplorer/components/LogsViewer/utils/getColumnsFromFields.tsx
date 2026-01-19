import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import i18next from 'i18next';
import { Space, Tooltip } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import { Field } from '../../../types';
import LogFieldValue from '../components/LogFieldValue';
import { OptionsType, OnValueFilterParams } from '../types';
import toString from './toString';

export default function getColumnsFromFields(params: {
  colWidths?: { [key: string]: number };
  indexData?: Field[];
  fields: string[];
  timeField?: string;
  options?: OptionsType;
  onValueFilter?: (parmas: OnValueFilterParams) => void;
  data?: any[];
  tableColumnsWidthCacheKey?: string;
  onOpenOrganizeFieldsModal?: () => void;
  setLogViewerDrawerState?: React.Dispatch<React.SetStateAction<{ visible: boolean; value: any }>>;
}) {
  const {
    colWidths,
    indexData,
    fields,
    timeField: time_field,
    options,
    onValueFilter,
    data,
    tableColumnsWidthCacheKey,
    onOpenOrganizeFieldsModal,
    setLogViewerDrawerState,
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
        return (
          <div className='max-h-[140px]'>
            {onValueFilter ? (
              <LogFieldValue enableTooltip name={item} value={toString(record[item])} onTokenClick={onValueFilter} rawValue={record} />
            ) : (
              <Tooltip placement='topLeft' overlayClassName='ant-tooltip-max-width-600' title={toString(record[item])}>
                {toString(record[item])}
              </Tooltip>
            )}
          </div>
        );
      },
    };
  });
  if (time_field && options?.time === 'true') {
    columns.unshift({
      name: i18next.t('log_explorer:logs.settings.time'),
      key: '___time___',
      width: 140,
      sortable: true,
      resizable: false,
      formatter: ({ row }) => {
        return (
          <Tooltip title={i18next.t('log_explorer:log_viewer_drawer_trigger_tip')}>
            <div
              className='cursor-pointer'
              onClick={() => {
                setLogViewerDrawerState?.({ visible: true, value: _.omit(row, ['__expanded', '__id', '__type']) });
              }}
            >
              {moment(row[time_field]).format('MM-DD HH:mm:ss.SSS')}
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
        const idx = _.findIndex(data, { ___id___: row.___id___ });
        return (
          <Tooltip title={i18next.t('log_explorer:log_viewer_drawer_trigger_tip')}>
            <div
              className='cursor-pointer'
              onClick={() => {
                setLogViewerDrawerState?.({ visible: true, value: _.omit(row, ['__expanded', '__id', '__type']) });
              }}
            >
              {idx + 1}
            </div>
          </Tooltip>
        );
      },
    });
  }
  return columns;
}
