import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import i18next from 'i18next';
import { Space, Tooltip } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';

import { Field } from '@/pages/explorer/components/FieldsList/types';

import toString from './toString';
import FieldValueWithFilter from '../components/FieldValueWithFilter';
import { OptionsType } from '../types';

export default function getColumnsFromFields(params: {
  colWidths?: { [key: string]: number };
  indexData?: Field[];
  fields: string[];
  timeField?: string;
  options?: OptionsType;
  updateOptions?: (options: any, reload?: boolean) => void;
  onValueFilter?: (parmas: { key: string; value: string; operator: 'AND' | 'NOT' }) => void;
}) {
  const { colWidths, indexData, fields, timeField: time_field, options, updateOptions, onValueFilter } = params;
  const columns: any[] = _.map(fields, (item) => {
    const organizeFields = options?.organizeFields || [];
    const iconsWidth = _.includes(organizeFields, item) ? 20 : 40; // 预留图标宽度
    let realName = item;
    if (indexData && !_.find(indexData, { field: item })) {
      const firstPart = item.split('.')[0];
      if (_.find(indexData, { field: firstPart })) {
        realName = firstPart;
      }
    }

    return {
      width: (colWidths?.[item] || 160) + iconsWidth + 16, // 16 是表格内边距
      key: item,
      title: (
        <Space>
          {item}
          {updateOptions && (
            <>
              {!_.includes(organizeFields, realName) && (
                <PlusCircleOutlined
                  onClick={() => {
                    updateOptions({
                      organizeFields: _.concat(organizeFields, realName),
                    });
                  }}
                />
              )}
              <MinusCircleOutlined
                onClick={() => {
                  if (_.includes(organizeFields, realName)) {
                    // 如果该字段已选，则移除
                    updateOptions({
                      organizeFields: _.filter(organizeFields, (field) => field !== realName),
                    });
                  } else {
                    // 否则就反选
                    updateOptions({
                      organizeFields: _.filter(indexData ? _.map(indexData, 'field') : fields, (field) => field !== realName),
                    });
                  }
                }}
              />
            </>
          )}
        </Space>
      ),
      dataIndex: item,
      render: (_text, record) => {
        return (
          <div className='max-h-[140px]'>
            {onValueFilter ? (
              <FieldValueWithFilter enableTooltip name={item} value={toString(record[item])} onValueFilter={onValueFilter} rawValue={record} />
            ) : (
              toString(record[item])
            )}
          </div>
        );
      },
    };
  });
  if (time_field && options?.time === 'true') {
    columns.unshift({
      title: i18next.t('explorer:logs.settings.time'),
      dataIndex: '___time___',
      width: 140,
      render: (_text, record) => {
        return <div>{moment(record[time_field]).format('MM-DD HH:mm:ss.SSS')}</div>;
      },
    });
  }
  if (options?.lines === 'true') {
    columns.unshift({
      title: i18next.t('explorer:logs.settings.lines'),
      dataIndex: '___lines___',
      width: 40,
      render: (_, _record, idx) => {
        return <div>{idx + 1}</div>;
      },
    });
  }
  return columns;
}
