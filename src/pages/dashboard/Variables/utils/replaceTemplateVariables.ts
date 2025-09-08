import moment from 'moment';
import _ from 'lodash';

import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { getDefaultStepByTime } from '@/pages/dashboard/utils';

import { IVariable } from '../types';
import adjustData from './ajustData';
import { formatString, formatDatasource } from './formatString';

export type { IVariable } from '../types';

export default function replaceTemplateVariables(
  str: string,
  params: {
    variablesWithOptions?: IVariable[];
    range?: IRawTimeRange;
    step?: number;
    stepParams?: {
      panelWidth?: number;
      maxDataPoints?: number;
    };
    scopedVars?: { [key: string]: any };
  },
) {
  const { variablesWithOptions, range, step, stepParams, scopedVars } = params;
  if (!str || !variablesWithOptions || variablesWithOptions.length === 0) {
    return str;
  }

  let extVariables: IVariable[] = [];

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
    extVariables = [
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

  const data = adjustData(_.concat(variablesWithOptions, extVariables), {
    datasourceList: [],
  });
  const result = formatString(str, data);
  return result;
}

export function replaceDatasourceVariables(
  value: string | number,
  params: {
    variables: IVariable[];
    datasourceList: any[];
  },
) {
  if (typeof value === 'number') return value;
  const { variables, datasourceList = [] } = params;
  if (!value || !variables || variables.length === 0) {
    console.warn('replaceDatasourceVariables: no variables found');
    return undefined;
  }
  const data = adjustData(variables, {
    datasourceList,
  });
  const result = formatDatasource(value, data);
  return result;
}
