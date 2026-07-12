export const NAME_SPACE = 'n9e-ck';
export const CACHE_KEY = 'ck-query-history-records';

export const NG_QUERY_CACHE_KEY = 'ng-ck-query-history-records-v2';
export const NG_QUERY_CACHE_PICK_KEYS = ['database', 'table', 'time_field', 'query_builder_filter', 'stackByField'];
export const NG_SQL_CACHE_KEY = 'ng-ck-sql-history-records-v2';

export const NG_QUERY_LOGS_OPTIONS_CACHE_KEY = 'ng-ck-query-logs-options';
export const NG_SQL_LOGS_OPTIONS_CACHE_KEY = 'ng-ck-sql-logs-options';
export const QUERY_LOGS_TABLE_COLUMNS_WIDTH_CACHE_KEY = 'ck-query-logs-table-columns-width';
export const SQL_LOGS_TABLE_COLUMNS_WIDTH_CACHE_KEY = 'ck-sql-logs-table-columns-width';
export const QUERY_LOGS_ORGANIZE_FIELDS_CACHE_KEY = 'ck-query-logs-organize-fields';

export const PIN_INDEX_CACHE_KEY = 'ck_query_logs_pin_index';
export const QUERY_BUILDER_PINNED_CACHE_KEY = 'ck-query-builder-pinned';
export const DEFAULT_LOGS_PAGE_SIZE = 30;
export const HIGHLIGHT_FIELD = '__highlight__';

export const DATE_TYPE_LIST = ['date', 'date32', 'datetime', 'datetime64'];

export function isCKDateType(type?: string, normalizedType?: string): boolean {
  if (normalizedType === 'date') return true;
  const value = (type || '').replace(/^Nullable\((.*)\)$/, '$1').toLowerCase();
  return DATE_TYPE_LIST.some((dateType) => value === dateType || value.startsWith(`${dateType}(`));
}

export function isCKNumberType(type?: string, normalizedType?: string): boolean {
  if (normalizedType === 'long' || normalizedType === 'number') return true;
  const value = (type || '').replace(/^Nullable\((.*)\)$/, '$1').toLowerCase();
  return /^(u?int\d*|float\d*|decimal)/.test(value);
}

export function getCKFieldIconType(type?: string, normalizedType?: string): 'string' | 'number' | 'date' | 'boolean' | undefined {
  if (isCKDateType(type, normalizedType)) return 'date';
  if (isCKNumberType(type, normalizedType)) return 'number';
  if (normalizedType === 'bool' || normalizedType === 'boolean' || /^(nullable\()?bool\)?$/i.test(type || '')) return 'boolean';
  if (['text', 'string', 'fixedstring', 'ipv4', 'ipv6', 'uuid', 'enum8', 'enum16'].includes((normalizedType || '').toLowerCase())) return 'string';
  return undefined;
}
