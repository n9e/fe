import _ from 'lodash';
import moment from 'moment';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { replaceExpressionVars } from '../../VariableConfig/constant';
import { fetchHistoryRangeBatch, fetchHistoryInstantBatch } from '@/services/dashboardV2';
import { ITarget } from '../../types';
import { IVariable } from '../../VariableConfig/definition';
import replaceExpressionBracket from '../utils/replaceExpressionBracket';
import { completeBreakpoints, getSerieName } from './utils';

interface IOptions {
  dashboardId: string;
  datasourceCate: string;
  datasourceValue: number; // 关联变量时 datasourceValue: string
  id?: string;
  time: IRawTimeRange;
  step: number | null;
  targets: ITarget[];
  variableConfig?: IVariable[];
  spanNulls?: boolean;
}

const getDefaultStepByStartAndEnd = (start: number, end: number) => {
  return Math.max(Math.floor((end - start) / 240), 1);
};

export default async function prometheusQuery(options: IOptions) {
  const { dashboardId, id, time, step, targets, variableConfig, spanNulls } = options;
  if (!time.start) return Promise.resolve([]);
  const parsedRange = parseRange(time);
  let start = moment(parsedRange.start).unix();
  let end = moment(parsedRange.end).unix();
  let _step: any = step;
  if (!step) _step = getDefaultStepByStartAndEnd(start, end);
  const series: any[] = [];
  let batchQueryParams: any[] = [];
  let batchInstantParams: any[] = [];
  let exprs: string[] = [];
  let refIds: string[] = [];
  let signalKey = `${id}`;
  const datasourceValue = variableConfig ? replaceExpressionVars(options.datasourceValue as any, variableConfig, variableConfig.length, dashboardId) : options.datasourceValue;
  if (targets && typeof datasourceValue === 'number') {
    _.forEach(targets, (target) => {
      if (target.time) {
        const parsedRange = parseRange(target.time);
        start = moment(parsedRange.start).unix();
        end = moment(parsedRange.end).unix();
        if (!step) _step = getDefaultStepByStartAndEnd(start, end);
      }
      if (target.step) {
        _step = target.step;
      }

      // TODO: 消除毛刺？
      start = start - (start % _step!);
      end = end - (end % _step!);

      const realExpr = variableConfig ? replaceExpressionVars(target.expr, variableConfig, variableConfig.length, dashboardId) : target.expr;
      if (realExpr) {
        if (target.instant) {
          batchInstantParams.push({
            time: end,
            query: realExpr,
          });
        } else {
          batchQueryParams.push({
            end,
            start,
            query: realExpr,
            step: _step,
          });
        }
        exprs.push(target.expr);
        refIds.push(target.refId);
        signalKey += `-${target.expr}`;
      }
    });
    try {
      if (!_.isEmpty(batchQueryParams)) {
        const res = await fetchHistoryRangeBatch({ queries: batchQueryParams, datasource_id: datasourceValue }, signalKey);
        const dat = res.dat || [];
        for (let i = 0; i < dat?.length; i++) {
          var item = {
            result: dat[i],
            expr: exprs[i],
            refId: refIds[i],
          };
          const target = _.find(targets, (t) => t.expr === item.expr);
          _.forEach(item.result, (serie) => {
            series.push({
              id: _.uniqueId('series_'),
              refId: item.refId,
              name: target?.legend ? replaceExpressionBracket(target?.legend, serie.metric) : getSerieName(serie.metric),
              metric: serie.metric,
              expr: item.expr,
              data: !spanNulls ? completeBreakpoints(_step, serie.values) : serie.values,
            });
          });
        }
      }
      if (!_.isEmpty(batchInstantParams)) {
        const res = await fetchHistoryInstantBatch({ queries: batchInstantParams, datasource_id: datasourceValue }, signalKey);
        const dat = res.dat || [];
        for (let i = 0; i < dat?.length; i++) {
          var item = {
            result: dat[i],
            expr: exprs[i],
            refId: refIds[i],
          };
          const target = _.find(targets, (t) => t.expr === item.expr);
          _.forEach(item.result, (serie) => {
            series.push({
              id: _.uniqueId('series_'),
              refId: item.refId,
              name: target?.legend ? replaceExpressionBracket(target?.legend, serie.metric) : getSerieName(serie.metric),
              metric: serie.metric,
              expr: item.expr,
              data: !spanNulls ? completeBreakpoints(_step, [serie.value]) : [serie.value],
            });
          });
        }
      }
      return Promise.resolve(series);
    } catch (e) {
      console.error(e);
      return Promise.reject(e);
    }
  }
  return Promise.resolve([]);
}
