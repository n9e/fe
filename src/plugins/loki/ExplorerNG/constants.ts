import { NAME_SPACE } from '../constants';

export const DEFAULT_LOGS_PAGE_SIZE = 30;
export const LOGS_OPTIONS_CACHE_KEY = `ng-${NAME_SPACE}-explorerng-logs-options`;
export const LOGS_TABLE_COLUMNS_WIDTH_CACHE_KEY = `ng-${NAME_SPACE}-explorerng-logs-table-columns-width`;
export const METRIC_TABLE_OPTIONS_CACHE_KEY = `ng-${NAME_SPACE}-explorerng-metric-table-options`;
export const METRIC_TABLE_COLUMNS_WIDTH_CACHE_KEY = `ng-${NAME_SPACE}-explorerng-metric-table-columns-width`;
export const QUERY_CACHE_KEY = `ng-${NAME_SPACE}-explorerng-query-history-records`;
export const BUILDER_PINNED_CACHE_KEY = `ng-${NAME_SPACE}-explorerng-builder-pinned-state`;
export const RAW_DEFAULT_QUERY = '{}';
export const METRIC_DEFAULT_QUERY = '';
export const DEFAULT_TIME_FIELD = 'timestamp';
export const DEFAULT_RAW_LOG_LIMIT = 500;
export const MAX_RAW_LOG_LIMIT = 10000;
