import _ from 'lodash';

export interface Operator {
  showTime: boolean;
  prettifyJson: boolean;
}
export interface Row {
  time: string;
  tags: object;
  log: string;
}
export interface Rows {
  rows: Row[];
  rowsLength: number;
}
export function getStreamTableRows(data: any[]): Rows[] {
  return data?.map(({ stream, values }: { stream: object; values: [] }) => {
    return {
      rows: values?.map(([time, log]: [string, string]) => ({
        time,
        tags: stream,
        // id: _.uniqueId('row_'),
        log,
      })),
      get rowsLength(): number {
        return this?.rows?.length || 0;
      },
    };
  });
}

export function parseResponse(data: any[]) {
  const rows = getStreamTableRows(data);
  const length = rows?.length || 0;
  let dataRows = <Row[]>[];

  if (length > 0) {
    for (let row of rows) {
      dataRows.push(...row.rows);
    }
  }
  return {
    // 默认按时间降序
    dataRows: _.sortBy(dataRows.flat(), (row) => -row.time),
    length,
  };
}

export const getRowSytleColor = (level: string) => {
  switch (level) {
    case 'debug':
      return '#1F78C1';
    case 'info':
      return 'green';
    case 'warn':
      return '#EAB839';
    case 'error':
      return '#E24D42';
    default:
      return 'green';
  }
};

export const getKeywords = (log_ql: string) => {
  const match = log_ql.match(/(\|=[^|]*|\|~[^|]*)/g);
  // 去除字符串开头和结尾的反引号或双引号
  return match
    ? match.map((m) => {
        let keyword = _.trim(m.substring(2));
        if (keyword.startsWith('`') || keyword.startsWith('"')) {
          keyword = keyword.substring(1);
        }
        if (keyword.endsWith('`') || keyword.endsWith('"')) {
          keyword = keyword.substring(0, keyword.length - 1);
        }
        return keyword;
      })
    : [];
};

export enum LogSortItem {
  'NEWEST_FIRST' = '最新优先',
  'OLDEST_FIRST' = '旧的优先',
}
