import _ from 'lodash';

import { OnValueFilterParams } from '@/pages/logExplorer/components/LogsViewer/types';

import { VictoriaLogsFilter, VictoriaLogsQuery } from '../types';
import { renderLogsQL, splitLogsQLPipes } from './logsQL';

function toFilter(params: OnValueFilterParams): VictoriaLogsFilter | undefined {
  const op =
    params.operator === 'AND' ? 'eq' : params.operator === 'NOT' ? 'neq' : params.operator === 'EXISTS' ? 'exists' : undefined;

  if (!op || !_.trim(params.key)) return undefined;

  const base = {
    id: _.uniqueId('field_filter_'),
    field: params.key,
    op,
  } as const;

  if (op === 'exists') return base;

  const value = params.value;
  if (value == null) return undefined;

  return { ...base, value };
}

/** 将日志字段菜单操作转换为 VictoriaLogs 查询条件。 */
export default function appendFieldFilter(query: VictoriaLogsQuery, params: OnValueFilterParams): VictoriaLogsQuery | undefined {
  const filter = toFilter(params);
  if (!filter) return undefined;

  if (query.querySource === 'builder' && query.builderStatus === 'synced') {
    const filters = [...(query.builder?.raw?.filters || []), filter];
    return {
      ...query,
      query: renderLogsQL({ filters }),
      builder: {
        ...query.builder,
        raw: { filters },
      },
    };
  }

  const filterQL = renderLogsQL({ filters: [filter] });
  const currentQuery = _.trim(query.query || '*') || '*';
  return {
    ...query,
    // 无管道的原始查询与 Builder 一样使用空格连接条件；有管道时保留 filter 在处理链末尾，保证可筛选 extract/json 派生字段。
    query: splitLogsQLPipes(currentQuery).length > 1 ? `${currentQuery} | filter ${filterQL}` : `${currentQuery} ${filterQL}`,
    querySource: 'code',
    builderStatus: 'stale',
  };
}
