import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import i18next from 'i18next';

import getTextWidth from '@/utils/getTextWidth';

import toString from './toString';
import FieldValueWithFilter from '../components/FieldValueWithFilter';

export default function getColumnsFromFields(selectedFields: string[], time_field?: string, options?: any, onValueFilter?: any) {
  const columns: any[] = _.map(selectedFields, (item) => {
    return {
      title: item,
      render: (record) => {
        return (
          <div
            style={{
              minWidth: getTextWidth(item) + 40, // sorter width
            }}
          >
            {onValueFilter ? <FieldValueWithFilter name={item} value={toString(record[item])} onValueFilter={onValueFilter} rawValue={record} /> : toString(record[item])}
          </div>
        );
      },
    };
  });
  if (time_field && options?.time === 'true') {
    columns.unshift({
      title: i18next.t('explorer:logs.settings.time'),
      dataIndex: time_field,
      width: 200,
      render: (text) => {
        return moment(text).format('MM-DD HH:mm:ss.SSS');
      },
    });
  }
  if (options?.lines === 'true') {
    columns.unshift({
      title: i18next.t('explorer:logs.settings.lines'),
      width: 50,
      render: (_, _record, idx) => {
        return idx + 1;
      },
    });
  }
  return columns;
}
