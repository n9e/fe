import _ from 'lodash';
import { DatasourceCateEnum } from '@/utils/constant';
import type { ITarget } from '@/pages/dashboard/types';

import getProDefaultTargets from 'plus:/parcels/Dashboard/getDefaultTargets';

const isTarget = (value: unknown): value is ITarget => {
  if (value == null || typeof value !== 'object') {
    return false;
  }
  const target = value as Record<string, unknown>;
  return typeof target.refId === 'string' && (target.query === undefined || (target.query !== null && typeof target.query === 'object' && !Array.isArray(target.query)));
};

const getPluginDefaultTargets = (datasourceCate: DatasourceCateEnum): ITarget[] | undefined => {
  const result: unknown = getProDefaultTargets(datasourceCate);
  return Array.isArray(result) && result.every(isTarget) ? result : undefined;
};

const getDefaultTargets = (datasourceCate: DatasourceCateEnum) => {
  if (_.includes(['elasticsearch', 'opensearch'], datasourceCate)) {
    return [
      {
        refId: 'A',
        query: {
          index: '',
          filters: '',
          values: [
            {
              func: 'count',
            },
          ],
          date_field: '@timestamp',
        },
      },
    ];
  } else if (datasourceCate === DatasourceCateEnum.zabbix) {
    return [
      {
        refId: 'A',
        query: {
          mode: 'timeseries',
          subMode: 'metrics',
        },
      },
    ];
  }
  const result = getPluginDefaultTargets(datasourceCate);
  if (result) {
    return result;
  }
  return [
    {
      refId: 'A',
    },
  ];
};

export default getDefaultTargets;
