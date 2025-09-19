export const NAME_SPACE = 'db_doris';
export const QUERY_CACHE_KEY = 'doris-query-history-records';
export const SQL_CACHE_KEY = 'doris-sql-history-records';
export const QUERY_SIDEBAR_CACHE_KEY = 'doris-query-sidebar';
export const SQL_SIDEBAR_CACHE_KEY = 'doris-meta-sidebar';
export const TYPE_MAP: Record<string, string> = {
  float: 'number',
  float64: 'number',
  double: 'number',
  integer: 'number',
  int64: 'number',
  long: 'number',
  date: 'date',
  date_nanos: 'date',
  string: 'string',
  text: 'string',
  scaled_float: 'number',
  nested: 'nested',
  histogram: 'number',
  boolean: 'boolean',
};
