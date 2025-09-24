import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import i18next from 'i18next';
import { measureTextWidth } from '@ant-design/plots';

import { NAME_SPACE } from '../constants';
import { FieldValueWithFilter } from './components/RawList';
import { FieldConfigVersion2 } from '@/pages/log/IndexPatterns/types';
export const getSerieName = (metric: any) => {
  const metricName = metric?.__name__ || '';
  const labels = _.keys(metric)
    .filter((ml) => ml !== '__name__')
    .map((label) => {
      return `${label}="${metric[label]}"`;
    });

  return `${metricName}{${_.join(labels, ',')}}`;
};

export function toString(val: any) {
  if (typeof val === 'string') {
    return val;
  }
  try {
    return JSON.stringify(val);
  } catch (e) {
    return 'unknow';
  }
}

export function getFieldsFromSQLData(data: { [index: string]: string | number }[]) {
  let fields: string[] = [];
  _.forEach(data, (item) => {
    fields = _.union(fields, _.keys(item));
  });
  return fields;
}

export const filteredFields = (fields: string[], organizeFields: string[]) => {
  return _.filter(fields, (item) => {
    if (_.includes(['__time', '__package_offset__', '___raw___', '___id___'], item)) {
      return false;
    }
    if (!_.isEmpty(organizeFields)) {
      return _.includes(organizeFields, item);
    }
    return true;
  });
};

export function getColumnsFromFields(selectedFields: string[], time_field?: string, options?: any, onValueFilter?: any, fieldConfig?: FieldConfigVersion2) {
  const columns: any[] = _.map(selectedFields, (item) => {
    return {
      title: item,
      render: (record) => {
        return (
          <div
            style={{
              minWidth: measureTextWidth(item) + 40, // sorter width
            }}
          >
            {onValueFilter ? (
              <FieldValueWithFilter name={item} value={toString(record[item])} onValueFilter={onValueFilter} rawValue={item} fieldConfig={fieldConfig} />
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
      title: i18next.t(`${NAME_SPACE}:logs.settings.time`),
      dataIndex: time_field,
      width: 200,
      render: (text) => {
        return moment(text).format('MM-DD HH:mm:ss.SSS');
      },
    });
  }
  if (options?.lines === 'true') {
    columns.unshift({
      title: i18next.t(`${NAME_SPACE}:logs.settings.lines`),
      width: 50,
      render: (_, _record, idx) => {
        return idx + 1;
      },
    });
  }
  return columns;
}

export function getLocalstorageOptions(logsOptionsCacheKey: string) {
  const defaultOptions = {
    logMode: 'origin',
    lineBreak: 'false',
    reverse: 'true',
    jsonDisplaType: 'tree',
    jsonExpandLevel: 1,
    organizeFields: [],
    lines: 'true',
    time: 'true',
  };
  const options = localStorage.getItem(`${logsOptionsCacheKey}@options`);

  if (options) {
    try {
      return JSON.parse(options);
    } catch (e) {
      return defaultOptions;
    }
  }
  return defaultOptions;
}

export function setLocalstorageOptions(logsOptionsCacheKey, options) {
  localStorage.setItem(`${logsOptionsCacheKey}@options`, JSON.stringify(options));
}
