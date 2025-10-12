/**
 * 各数据源的查询方法
 */

import { DatasourceCateEnum } from '@/utils/constant';
import prometheus from '@/plugins/prometheus/Dashboard/variableDatasource';
import elasticsearch from '@/plugins/elasticsearch/Dashboard/variableDatasource';
import clickHouse from '@/plugins/clickHouse/Dashboard/VariableDatasource';

// @ts-ignore
import variableDatasourcePro from 'plus:/parcels/Dashboard/variableDatasource';

export interface Props<QueryType = any> {
  datasourceCate: string;
  datasourceValue: number;
  datasourceList: any[];
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
