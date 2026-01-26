export const NAME_SPACE = 'db_doris';
export const QUERY_CACHE_KEY = 'doris-query-history-records';
export const QUERY_CACHE_PICK_KEYS = ['database', 'table', 'time_field', 'query'];
export const SQL_CACHE_KEY = 'doris-sql-history-records';
export const QUERY_SIDEBAR_CACHE_KEY = 'doris-query-sidebar';
export const SQL_SIDEBAR_CACHE_KEY = 'doris-meta-sidebar';
export const QUERY_LOGS_OPTIONS_CACHE_KEY = 'doris-query-logs-options';
export const SQL_LOGS_OPTIONS_CACHE_KEY = 'doris-sql-logs-options';
export const QUERY_LOGS_TABLE_COLUMNS_WIDTH_CACHE_KEY = 'doris-query-logs-table-columns-width';
export const SQL_LOGS_TABLE_COLUMNS_WIDTH_CACHE_KEY = 'doris-sql-logs-table-columns-width';
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
export const DATE_TYPE_LIST = ['date', 'timestamp', 'datetime'];
export const DEFAULT_LOGS_PAGE_SIZE = 30;

export const NG_QUERY_CACHE_KEY = 'ng-doris-query-history-records-v2';
export const NG_QUERY_CACHE_PICK_KEYS = ['database', 'table', 'time_field', 'query', 'stackByField', 'defaultSearchField'];
export const NG_SQL_CACHE_KEY = 'ng-doris-sql-history-records-v2';

export const NG_QUERY_LOGS_OPTIONS_CACHE_KEY = 'ng-doris-query-logs-options';
export const NG_SQL_LOGS_OPTIONS_CACHE_KEY = 'ng-doris-sql-logs-options';

export const QUERY_LOGS_ORGANIZE_FIELDS_CACHE_KEY = 'doris-query-logs-organize-fields';

export const PIN_INDEX_CACHE_KEY = 'doris_query_logs_pin_index';
export const DEFAULT_SEARCH_INDEX_CACHE_KEY = 'doris_query_logs_default_search_index';

export const SIDEBAR_CACHE_KEY = 'doris-explorer-sidebar';

export const QUERY_BUILDER_PINNED_CACHE_KEY = 'doris-query-builder-pinned';
