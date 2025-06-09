import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { measureTextWidth } from '@ant-design/plots';

export function getColumnsFromFields(selectedFields: string[], dateField?: string, timeField?: boolean) {
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
          return (
            <div
              style={{
                minWidth: measureTextWidth(item) + 30, // sorter width
              }}
            >
              {record[item]}
            </div>
          );
        },
      };
    });
  }
  if (dateField && timeField) {
    columns.unshift({
      title: 'Time',
      dataIndex: dateField,
      width: 200,
      render: (text) => {
        return _.isNumber(text) ? moment.unix(text).format('YYYY-MM-DD HH:mm:ss'): text;
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

const prefixKey = 'aliyun-sls-explorer';

export function getLocalstorageOptions(project?: string, logstore?: string) {
  const defaultOptions = {
    logMode: 'origin',
    lineBreak: 'true',
    reverse: 'true',
    jsonDisplaType: 'tree',
    jsonExpandLevel: 1,
    organizeFields: [],
  };
  if (project && logstore) {
    const options = localStorage.getItem(`${prefixKey}@${project}@${logstore}@options`);

    if (options) {
      try {
        return JSON.parse(options);
      } catch (e) {
        return defaultOptions;
      }
    }
    return defaultOptions;
  }
  return defaultOptions;
}

export function setLocalstorageOptions(project, logstore, options) {
  localStorage.setItem(`${prefixKey}@${project}@${logstore}@options`, JSON.stringify(options));
}

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

export function getSqlByQuery(query: string) {
  const sql = _.split(query, '|')[1];
  return _.replace(sql, /\[[^\]*]\]/g, '');
}

export function getFields(logs, query) {
  const parser = new (window as any).NodeSQLParser.Parser();
  let ast: any;
  try {
    ast = parser.astify(getSqlByQuery(query));
  } catch (e) {
    console.error(e);
  }
  const fields = _.map(ast?.columns, (item) => {
    if (item.as) return item.as;
    return item?.expr?.column;
  });
  _.forEach(logs, (log) => {
    _.forEach(log, (_val, key) => {
      if (fields.indexOf(key) === -1 && key !== '__time__' && key !== '__source__') {
        fields.push(key);
      }
    });
  });
  return fields;
}

export const setLocalQueryHistory = (datasourceValue: number, project: string, query: string) => {
  if (!query) return;
  const localKey = `aliyun-sls-query-history-${datasourceValue}-${project}`;
  query = _.trim(query);
  const queryHistoryStr = localStorage.getItem(localKey);
  let queryHistoryMap = new Map();
  if (queryHistoryStr) {
    try {
      const queryHistory = JSON.parse(queryHistoryStr);
      queryHistoryMap = new Map(queryHistory);
    } catch (e) {
      console.error(e);
    }
  }
  if (queryHistoryMap.has(query)) {
    const count = queryHistoryMap.get(query);
    let newCount = 1;
    if (_.isNumber(count)) {
      newCount = count + 1;
    }
    queryHistoryMap.set(query, newCount);
  } else {
    if (queryHistoryMap.size < 20) {
      queryHistoryMap.set(query, 1);
    } else {
      const minCount = _.min(Array.from(queryHistoryMap.values()));
      if (minCount) {
        for (const x of queryHistoryMap.entries()) {
          if (x[1] === minCount) {
            queryHistoryMap.delete(x[0]);
            break;
          }
        }
        queryHistoryMap.set(query, 1);
      }
    }
  }
  const newQueryHistory: [string, number][] = [];
  for (const x of queryHistoryMap.entries()) {
    newQueryHistory.push(x);
  }
  localStorage.setItem(localKey, JSON.stringify(newQueryHistory));
};

export const getLocalQueryHistory = (datasourceValue: number, project: string) => {
  const localKey = `aliyun-sls-query-history-${datasourceValue}-${project}`;
  const queryHistoryStr = localStorage.getItem(localKey);
  let queryHistoryMap = new Map();
  if (queryHistoryStr) {
    try {
      const queryHistory = JSON.parse(queryHistoryStr);
      queryHistoryMap = new Map(queryHistory);
    } catch (e) {
      console.error(e);
    }
  }
  const queryHistory: [string, number][] = [];
  for (const x of queryHistoryMap.entries()) {
    queryHistory.push(x);
  }
  return _.slice(_.reverse(_.sortBy(queryHistory, (item) => item[1])), 0, 10);
};
