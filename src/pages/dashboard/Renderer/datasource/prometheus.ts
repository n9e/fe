import _ from 'lodash';
import moment from 'moment';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { fetchHistoryRangeBatch, fetchHistoryInstantBatch } from '@/services/dashboardV2';
import i18next from 'i18next';
import { ITarget } from '../../types';
import { IVariable } from '../../VariableConfig/definition';
import replaceExpressionBracket from '../utils/replaceExpressionBracket';
import { completeBreakpoints, getSerieName } from './utils';
import replaceFieldWithVariable from '../utils/replaceFieldWithVariable';
import { replaceExpressionVars, getOptionsList } from '../../VariableConfig/constant';

interface IOptions {
  id?: string; // panelId
  dashboardId: string;
  datasourceValue: number; // 关联变量时 datasourceValue: string
  time: IRawTimeRange;
  targets: ITarget[];
  variableConfig?: IVariable[];
  spanNulls?: boolean;
  scopedVars?: any;
  inspect?: boolean;
  type?: string;
}

const getDefaultStepByStartAndEnd = (start: number, end: number) => {
  return Math.max(Math.floor((end - start) / 240), 1);
};

interface Result {
  series: any[];
  query?: any[];
}

export default async function prometheusQuery(options: IOptions): Promise<Result> {
  const { dashboardId, id, time, targets, variableConfig, spanNulls, scopedVars, type } = options;
  if (!time.start) return Promise.resolve({ series: [] });
  const parsedRange = parseRange(time);
  let start = moment(parsedRange.start).unix();
  let end = moment(parsedRange.end).unix();
  let _step: any = getDefaultStepByStartAndEnd(start, end);

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
        _step = getDefaultStepByStartAndEnd(start, end);
      }
      if (target.step) {
        _step = target.step;
      }
      // TODO: 消除毛刺？
      start = start - (start % _step!);
      end = end - (end % _step!);

      const realExpr = variableConfig
        ? replaceFieldWithVariable(
            dashboardId,
            target.expr,
            getOptionsList(
              {
                dashboardId,
                variableConfigWithOptions: variableConfig,
              },
              time,
              _step,
            ),
            scopedVars,
          )
        : target.expr;
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
      let batchQueryRes: any = {};
      if (!_.isEmpty(batchQueryParams)) {
        batchQueryRes = await fetchHistoryRangeBatch({ queries: batchQueryParams, datasource_id: datasourceValue }, signalKey);
        const dat = batchQueryRes.dat || [];
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
      let batchInstantRes: any = {};
      if (!_.isEmpty(batchInstantParams)) {
        batchInstantRes = await fetchHistoryInstantBatch({ queries: batchInstantParams, datasource_id: datasourceValue }, signalKey);
        const dat = batchInstantRes.dat || [];
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
              data: serie.values ? serie.values : [serie.value],
            });
          });
        }
      }
      const resolveData: Result = { series };
      if (options.inspect) {
        resolveData.query = [];
        if (!_.isEmpty(batchQueryParams)) {
          resolveData.query.push({
            type: 'Query Range',
            request: {
              url: '/api/n9e/query-range-batch',
              method: 'POST',
              data: { queries: batchQueryParams, datasource_id: datasourceValue },
            },
            response: batchQueryRes,
          });
        }
        if (!_.isEmpty(batchInstantParams)) {
          resolveData.query.push({
            type: 'Query',
            request: {
              url: '/api/n9e/query-instant-batch',
              method: 'POST',
              data: { queries: batchInstantParams, datasource_id: datasourceValue },
            },
            response: batchInstantRes,
          });
        }
      }
      return Promise.resolve(resolveData);
    } catch (e) {
      console.error(e);
      return Promise.reject(e);
    }
  }
  if (datasourceValue !== 'number' && type !== 'text' && type !== 'iframe') {
    return Promise.reject({
      message: i18next.t('dashboard:detail.invalidDatasource'),
    });
  }
  return Promise.resolve({
    series: [],
  });
}
