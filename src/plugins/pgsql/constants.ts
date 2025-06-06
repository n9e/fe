import { DatasourceCateEnum } from '@/utils/constant';

export const NAME_SPACE = DatasourceCateEnum.pgsql;
export const STYLE_NAME_SPACE = `n9e-${NAME_SPACE}`;
export const HISTORY_RECORDS_CACHE_KEY = `${NAME_SPACE}-query-history-records`;
export const META_SIDEBAR_WIDTH_CACHE_KEY = `${NAME_SPACE}-meta-sidebar-width`;
export const QUERY_KEY = 'sql';
