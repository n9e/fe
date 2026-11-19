import type { LogOrderAnchor } from '@/pages/logExplorer/components/LogOrderContext/utils';

import type { FilterConfig } from '../types';

export interface DorisLogsQueryRequestParams {
  cate: string;
  datasourceId: number;
  database: string;
  table: string;
  timeField: string;
  query: string;
  queryBuilderFilter?: FilterConfig[];
  /** 已经解析好的查询时间范围（毫秒） */
  range: { from: number; to: number };
  lines: number;
  offset: number;
  reverse: boolean;
  defaultField?: string;
  /** 上一页最后一行的原文顺序锚点；存在时后端应按它翻页，不再依赖 offset */
  searchAfter?: LogOrderAnchor;
}

/** 组装 doris 日志查询请求体；从 Main/Query 的内联逻辑抽出，便于单测分页参数 */
export default function buildDorisLogsQueryRequest(params: DorisLogsQueryRequestParams) {
  const { cate, datasourceId, database, table, timeField, query, queryBuilderFilter, range, lines, offset, reverse, defaultField, searchAfter } = params;

  return {
    cate,
    datasource_id: datasourceId,
    query: [
      {
        database,
        table,
        time_field: timeField,
        query,
        query_builder_filter: queryBuilderFilter,
        from: range.from,
        to: range.to,
        lines,
        offset,
        reverse,
        default_field: defaultField,
        highlight: true,
        search_after: searchAfter ? { time: String(searchAfter.time), stream_id: searchAfter.streamId, seq: searchAfter.seq } : undefined,
      },
    ],
  };
}
