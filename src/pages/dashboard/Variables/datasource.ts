/**
 * 各数据源的查询方法
 */

import { DatasourceCateEnum } from '@/utils/constant';
import type { IRawTimeRange } from '@/components/TimeRangePicker';
import type { JsonValue } from '@/pages/dashboard/types';
import prometheus from '@/plugins/prometheus/Dashboard/variableDatasource';
import elasticsearch from '@/plugins/elasticsearch/Dashboard/variableDatasource';
import clickHouse from '@/plugins/clickHouse/Dashboard/VariableDatasource';

// @ts-ignore
import variableDatasourcePro from 'plus:/parcels/Dashboard/variableDatasource';

export type VariableDatasourceQuery = Record<
  string,
  JsonValue | IRawTimeRange | { index: string; date_field: string } | undefined
>;

export interface Props<QueryType = VariableDatasourceQuery> {
  datasourceCate: string;
  datasourceValue: number;
  datasourceList: import('../types').DashboardDatasource[];
  query: QueryType;
}

export default async function datasource(props: Props) {
  const { datasourceCate } = props;
  if (datasourceCate === DatasourceCateEnum.prometheus) {
    return prometheus(props);
  }
  if (datasourceCate === DatasourceCateEnum.elasticsearch) {
    return elasticsearch(props);
  }
  if (datasourceCate === DatasourceCateEnum.ck) {
    return clickHouse(props);
  }

  return await variableDatasourcePro(props);
}
