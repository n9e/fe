/**
 * 各数据源的查询方法
 */

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
  return await variableDatasourcePro(props);
}
