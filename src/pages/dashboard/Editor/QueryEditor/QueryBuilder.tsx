import React from 'react';

import { DatasourceCateEnum } from '@/utils/constant';

import { QueryBuilder as TDengine } from '@/plugins/TDengine';
import { QueryBuilder as CK } from '@/plugins/clickHouse';
import { IRawTimeRange } from '@/components/TimeRangePicker/types';

// @ts-ignore
import PlusQueryBuilder from 'plus:/parcels/Dashboard/QueryBuilder';

import Prometheus from './Prometheus';
import Elasticsearch from './Elasticsearch';

interface Props {
  range: IRawTimeRange;
  panelWidth?: number;
  cate: string;
  datasourceValue: number;
}

export default function QueryBuilder(props: Props) {
  const { panelWidth, cate, datasourceValue, range } = props;

  if (!datasourceValue || typeof datasourceValue !== 'number') return null;

  if (cate === DatasourceCateEnum.prometheus) {
    return <Prometheus panelWidth={panelWidth} datasourceValue={datasourceValue} range={range} />;
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

  return <PlusQueryBuilder cate={cate} datasourceValue={datasourceValue} />;
}
