import { DatasourceCateEnum } from '@/utils/constant';
import getUUID from './utils/getUUID';

export const NAME_SPACE = 'log_explorer';
export const PATHNAME = '/log/explorer';
export const DEFAULT_DATASOURCE_CATE = DatasourceCateEnum.doris;
export const DEFAULT_ACTIVE_KEY = getUUID();
export const LOCALE_KEY = 'ng_logs_explorer_items';
export const LOCALE_ACTIVE_KEY = 'ng_logs_explorer_items_active_key';
export const ENABLED_VIEW_CATES = [DatasourceCateEnum.doris, DatasourceCateEnum.aliyunSLS];
