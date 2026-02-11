import { DatasourceCateEnum } from '@/utils/constant';

import getUUID from './utils/getUUID';
import { OptionsType } from './components/LogsViewer/types';

export const NAME_SPACE = 'log_explorer';
export const PATHNAME = '/log/explorer';
export const DEFAULT_DATASOURCE_CATE = DatasourceCateEnum.doris;
export const DEFAULT_ACTIVE_KEY = getUUID();
export const LOCALE_KEY = 'ng_logs_explorer_items';
export const LOCALE_ACTIVE_KEY = 'ng_logs_explorer_items_active_key';
export const ENABLED_VIEW_CATES = [DatasourceCateEnum.doris, DatasourceCateEnum.aliyunSLS, DatasourceCateEnum.elasticsearch, DatasourceCateEnum.opensearch];

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

export const DEFAULT_OPTIONS: OptionsType = {
  logMode: 'origin',
  lineBreak: 'false',
  reverse: 'true',
  lines: 'true',
  time: 'true',
  jsonDisplaType: 'string',
  jsonExpandLevel: 1,
  topNumber: 5,
};
