import React from 'react';
import _ from 'lodash';
import moment from 'moment';

function localeCompareFunc(a, b) {
  return a.localeCompare(b);
}

export function getColumnsFromFields(selectedFields: string[], dateField?: string) {
  let columns: any[] = [];
  if (_.isEmpty(selectedFields)) {
    columns = [
      {
        title: 'Document',
        render(record) {
          return (
            <dl className='event-logs-row'>
              {_.map(record, (val, key) => {
                return (
                  <React.Fragment key={key}>
                    <dt>{key}:</dt> <dd>{val}</dd>
                  </React.Fragment>
                );
              })}
            </dl>
          );
        },
      },
    ];
  } else {
    columns = _.map(selectedFields, (item) => {
      return {
        title: item,
        render: (record) => {
          return record[item];
        },
        sorter: (a, b) => localeCompareFunc(_.get(a, item, ''), _.get(b, item, '')),
      };
    });
  }
  if (dateField) {
    columns.unshift({
      title: 'Time',
      dataIndex: dateField,
      width: 200,
      render: (text) => {
        return moment.unix(text).format('YYYY-MM-DD HH:mm:ss');
      },
      sorter: (a, b) => {
        return localeCompareFunc(_.get(a, dateField, ''), _.get(b, dateField, ''));
      },
    });
  }
  return columns;
}

export function getInnerTagKeys(log: { [index: string]: string }) {
  const innerFields: string[] = [];
  _.forEach(log, (_val, key) => {
    if (key.indexOf('__tag__') === 0) {
      innerFields.push(key);
    }
  });
  return innerFields;
}
