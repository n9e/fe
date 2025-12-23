import moment from 'moment';
import _ from 'lodash';

import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { getDefaultStepByTime } from '@/pages/dashboard/utils';
import { getGlobalState } from '@/pages/dashboard/globalState';

import { IVariable } from '../types';
import adjustData from './ajustData';
import { formatString, formatDatasource } from './formatString';

export type { IVariable } from '../types';

export default function replaceTemplateVariables(
  str: string,
  params?: {
    range?: IRawTimeRange;
    step?: number;
    stepParams?: {
      panelWidth?: number;
      maxDataPoints?: number;
    };
    scopedVars?: { [key: string]: any };
  },
) {
  // 如果 str 为空，如果没有包含变量则直接返回
  if (!str || !_.includes(str, '$')) {
    return str;
  }

  const variablesWithOptions = getGlobalState('variablesWithOptions');
  const globalRange = getGlobalState('range');
  const { scopedVars } = params || {};
  const range = params?.range ?? globalRange;

  let extVariables: IVariable[] = getBuiltInVariables(range, params);

  if (scopedVars) {
    extVariables = _.concat(
      extVariables,
      _.map(scopedVars, (value, key) => {
        return {
          name: key,
          value,
        } as IVariable;
      }),
    );
  }

  const data = adjustData(_.concat(variablesWithOptions ?? [], extVariables), {
    datasourceList: [],
  });
  const result = formatString(str, data);
  return result;
}

export function getBuiltInVariables(
  range,
  params?: {
    range?: IRawTimeRange;
    step?: number;
    stepParams?: {
      panelWidth?: number;
      maxDataPoints?: number;
    };
  },
) {
  const { step, stepParams } = params || {};

  let variables: IVariable[] = [];

  if (range) {
    const rangeTime = parseRange(range);
    const from = moment(rangeTime.start).valueOf();
    const fromDateSeconds = moment(rangeTime.start).unix();
    const fromDateISO = moment(rangeTime.start).toISOString();
    const to = moment(rangeTime.end).valueOf();
    const toDateSeconds = moment(rangeTime.end).unix();
    const toDateISO = moment(rangeTime.end).toISOString();
    // TODO: 如果没有传计算好的 step 则使用默认的 step 计算逻辑
    const interval = step
      ? step
      : getDefaultStepByTime(range, {
          panelWidth: stepParams?.panelWidth,
          maxDataPoints: stepParams?.maxDataPoints,
        });
    variables = [
      { name: '__from', value: from },
      { name: '__from_date_seconds', value: fromDateSeconds },
      { name: '__from_date_iso', value: fromDateISO },
      { name: '__from_date', value: fromDateISO },
      { name: '__to', value: to },
      { name: '__to_date_seconds', value: toDateSeconds },
      { name: '__to_date_iso', value: toDateISO },
      { name: '__to_date', value: toDateISO },
      { name: '__interval', value: `${interval}s` },
      { name: '__interval_ms', value: `${interval * 1000}ms` },
      { name: '__rate_interval', value: `${interval * 4}s` },
      { name: '__range', value: `${toDateSeconds - fromDateSeconds}s` },
      { name: '__range_s', value: `${toDateSeconds - fromDateSeconds}s` },
      { name: '__range_ms', value: `${(toDateSeconds - fromDateSeconds) * 1000}ms` },
    ] as IVariable[];
  }
  return variables;
}

export function replaceDatasourceVariables(
  value: string | number,
  params: {
    datasourceList: any[];
  },
) {
  const variablesWithOptions = getGlobalState('variablesWithOptions');
  if (typeof value === 'number') return value;
  const { datasourceList = [] } = params;
  if (!value || !variablesWithOptions || variablesWithOptions.length === 0) {
    console.warn('replaceDatasourceVariables: no variables found');
    return undefined;
  }
  const data = adjustData(variablesWithOptions, {
    datasourceList,
  });
  const result = formatDatasource(value, data);
  return result;
}
