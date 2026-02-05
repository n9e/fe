export const NAME_SPACE = 'elasticsearch';

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
export const DEFAULT_LOGS_PAGE_SIZE = 20;

export const LOGS_ORGANIZE_FIELDS_CACHE_KEY = `ng-${NAME_SPACE}-logs-organize-fields`;
export const LOGS_OPTIONS_CACHE_KEY = `ng-${NAME_SPACE}-logs-options`;
export const LOGS_TABLE_COLUMNS_WIDTH_CACHE_KEY = `ng-${NAME_SPACE}-logs-table-columns-width`;
export const QUERY_CACHE_KEY = `ng-${NAME_SPACE}-query-history-records`;
export const QUERY_CACHE_PICK_KEYS = ['mode', 'index', 'indexPattern', 'syntax', 'query'];
