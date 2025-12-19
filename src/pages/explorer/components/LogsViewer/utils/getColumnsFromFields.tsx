import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import i18next from 'i18next';
import { Space } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';

import getTextWidth from '@/utils/getTextWidth';
import { Field } from '@/pages/explorer/components/FieldsList/types';

import toString from './toString';
import FieldValueWithFilter from '../components/FieldValueWithFilter';
import { OptionsType } from '../types';

export default function getColumnsFromFields(params: {
  indexData?: Field[];
  fields: string[];
  timeField?: string;
  options?: OptionsType;
  updateOptions: (options: any, reload?: boolean) => void;
  onValueFilter?: (parmas: { key: string; value: string; operator: 'AND' | 'NOT' }) => void;
}) {
  const { indexData, fields, timeField: time_field, options, updateOptions, onValueFilter } = params;
  const columns: any[] = _.map(fields, (item) => {
    const organizeFields = options?.organizeFields || [];
    const iconsWidth = _.includes(organizeFields, item) ? 20 : 40; // 预留图标宽度
    let realName = item;
    if (!_.find(indexData, { field: item })) {
      const firstPart = item.split('.')[0];
      if (_.find(indexData, { field: firstPart })) {
        realName = firstPart;
      }
    }

    return {
      title: (
        <Space>
          {item}
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
                  organizeFields: _.filter(_.map(indexData, 'field'), (field) => field !== realName),
                });
              }
            }}
          />
        </Space>
      ),
      render: (record) => {
        return (
          <div
            className='max-h-[140px] overflow-auto'
            style={{
              minWidth:
                getTextWidth(item, {
                  fontWeight: '500', // table header font weight
                }) + iconsWidth,
            }}
          >
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
      dataIndex: time_field,
      render: (text) => {
        return (
          <div
            style={{
              minWidth: getTextWidth(i18next.t('explorer:logs.settings.time')),
            }}
          >
            {moment(text).format('MM-DD HH:mm:ss.SSS')}
          </div>
        );
      },
    });
  }
  if (options?.lines === 'true') {
    columns.unshift({
      title: i18next.t('explorer:logs.settings.lines'),
      render: (_, _record, idx) => {
        return (
          <div
            style={{
              minWidth: getTextWidth(i18next.t('explorer:logs.settings.lines')),
            }}
          >
            {idx + 1}
          </div>
        );
      },
    });
  }
  return columns;
}
