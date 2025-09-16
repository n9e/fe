import React from 'react';

import { DatasourceCateEnum } from '@/utils/constant';
import { IVariable } from '@/pages/dashboard/VariableConfig/definition';

import { QueryBuilder as TDengine } from '@/plugins/TDengine';
import { QueryBuilder as CK } from '@/plugins/clickHouse';

// @ts-ignore
import PlusQueryBuilder from 'plus:/parcels/Dashboard/QueryBuilder';

import Prometheus from './Prometheus';
import Elasticsearch from './Elasticsearch';

interface Props {
  panelWidth?: number;
  cate: string;
  datasourceValue: number;
  variables: IVariable[];
  dashboardId: string;
  time: any;
}

export default function QueryBuilder(props: Props) {
  const { panelWidth, cate, datasourceValue, variables, dashboardId, time } = props;

  if (!datasourceValue || typeof datasourceValue !== 'number') return null;

  if (cate === DatasourceCateEnum.prometheus) {
    return <Prometheus panelWidth={panelWidth} variableConfig={variables} time={time} datasourceValue={datasourceValue} />;
  }
  if (cate === DatasourceCateEnum.elasticsearch) {
    return <Elasticsearch datasourceValue={datasourceValue} />;
  }
  if (cate === DatasourceCateEnum.tdengine) {
    return <TDengine datasourceValue={datasourceValue} />;
  }
  if (cate === DatasourceCateEnum.ck) {
    return <CK datasourceValue={datasourceValue} />;
  }

  return <PlusQueryBuilder cate={cate} datasourceValue={datasourceValue} variables={variables} dashboardId={dashboardId} />;
}
