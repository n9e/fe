import { useCallback } from 'react';
import moment from 'moment';
import _ from 'lodash';

import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { getDefaultStepByTime } from '@/pages/dashboard/utils';
import { useGlobalState } from '@/pages/dashboard/globalState';
import type { DashboardDatasource, ScopedVariables } from '@/pages/dashboard/types';

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
    scopedVars?: ScopedVariables;
    /** Runtime variables supplied by an owning dashboard instance. */
    variables?: IVariable[];
  },
) {
  // 如果 str 为空，如果没有包含变量则直接返回
  // 变量格式支持：$var、${var}、[[var]]
  if (!str || (!_.includes(str, '$') && !_.includes(str, '[['))) {
    return str;
  }

  const variablesWithOptions = params?.variables ?? [];
  const { scopedVars } = params || {};
  const range = params?.range;

  let extVariables: IVariable[] = getBuiltInVariables(range, params);

  if (scopedVars) {
    extVariables = _.concat(
      extVariables,
      _.map(scopedVars, (value, key) => {
        // scopedVars 的值有两种形态：{ value } 对象（ScopedVariable）或原始值（扁平映射），统一在这里归一化
        const normalizedValue = _.isPlainObject(value) ? value.value : (value as IVariable['value']);
        return {
          name: key,
          value: normalizedValue,
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
  range: IRawTimeRange | undefined,
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
      { name: '__interval_ms', value: `${interval * 1000}` },
      { name: '__rate_interval', value: `${interval * 4}s` },
      { name: '__range', value: `${toDateSeconds - fromDateSeconds}s` },
      { name: '__range_s', value: `${toDateSeconds - fromDateSeconds}` },
      { name: '__range_ms', value: `${(toDateSeconds - fromDateSeconds) * 1000}` },
    ] as IVariable[];
  }
  return variables;
}

export function replaceDatasourceVariables(
  value: string | number,
  params: {
    datasourceList: DashboardDatasource[];
    /** Runtime variables supplied by an owning dashboard instance. */
    variables?: IVariable[];
  },
) {
  const variablesWithOptions = params.variables ?? [];
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

/**
 * 返回绑定当前仪表盘运行时变量和时间范围的插值函数。
 *
 * 视图组件应使用此 Hook，纯函数调用方则显式传入 variables 和 range，避免读取模块级状态。
 */
export function useReplaceTemplateVariables() {
  const [variables] = useGlobalState('variablesWithOptions');
  const [runtimeRange] = useGlobalState('range');

  return useCallback(
    (value: string, params?: Parameters<typeof replaceTemplateVariables>[1]) =>
      replaceTemplateVariables(value, {
        ...params,
        variables,
        range: params?.range ?? runtimeRange,
      }),
    [runtimeRange, variables],
  );
}

/** 返回绑定当前仪表盘变量的数据源值替换函数，供表单和查询组件使用。 */
export function useReplaceDatasourceVariables() {
  const [variables] = useGlobalState('variablesWithOptions');

  return useCallback(
    (value: string | number, params: Omit<Parameters<typeof replaceDatasourceVariables>[1], 'variables'>) =>
      replaceDatasourceVariables(value, {
        ...params,
        variables,
      }),
    [variables],
  );
}
