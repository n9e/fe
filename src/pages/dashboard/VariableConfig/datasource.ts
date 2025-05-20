/**
 * 各数据源的查询方法
 */

import { DatasourceCateEnum } from '@/utils/constant';
import clickHouse from '@/plugins/clickHouse/Dashboard/VariableDatasource';

import { IVariable } from './definition';

// @ts-ignore
import variableDatasourcePro from 'plus:/parcels/Dashboard/variableDatasource';

export interface Props<QueryType = any> {
  dashboardId: string;
  datasourceCate: string;
  datasourceValue: number;
  query: QueryType;
  variables: IVariable[];
}

export default async function datasource(props: Props) {
  const { datasourceCate } = props;
  if (datasourceCate === DatasourceCateEnum.ck) {
    return clickHouse(props);
  }

  return await variableDatasourcePro(props);
}
