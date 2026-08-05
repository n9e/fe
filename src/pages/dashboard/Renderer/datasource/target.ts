import _ from 'lodash';

import type { ITarget } from '@/pages/dashboard/types';

import type { DashboardQueryResultType } from './types';

export function isExpressionTarget(target?: ITarget) {
  return target?.kind === 'expression' || target?.__mode__ === '__expr__';
}

export function inferTargetResultType(target: ITarget): DashboardQueryResultType {
  const mode = String(target.query?.mode ?? '').toLowerCase();
  const valueFunctions = _.map(target.query?.values as unknown[] | undefined, 'func');
  if (_.includes(['raw', 'logs'], mode) || _.includes(valueFunctions, 'rawData')) {
    return 'logs';
  }
  if (_.includes(['timeseries', 'time_series'], mode)) {
    return 'time_series';
  }
  return target.resultType ?? 'time_series';
}

export function getTargetRefId(index: number) {
  let value = index;
  let refId = '';
  do {
    refId = String.fromCharCode(65 + (value % 26)) + refId;
    value = Math.floor(value / 26) - 1;
  } while (value >= 0);
  return refId;
}
