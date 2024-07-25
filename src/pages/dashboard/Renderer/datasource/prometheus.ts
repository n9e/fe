import _ from 'lodash';
import moment from 'moment';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { fetchHistoryRangeBatch, fetchHistoryInstantBatch, fetchHistoryRangeBatch2 } from '@/services/dashboardV2';
import i18next from 'i18next';
import { ITarget } from '../../types';
import { IVariable } from '../../VariableConfig/definition';
import replaceExpressionBracket from '../utils/replaceExpressionBracket';
import { completeBreakpoints, getSerieName } from './utils';
import replaceFieldWithVariable from '../utils/replaceFieldWithVariable';
import { replaceExpressionVars, getOptionsList } from '../../VariableConfig/constant';
import { alphabet } from '../utils/getFirstUnusedLetter';
import { N9E_PATHNAME, IS_PLUS } from '@/utils/constant';

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

const getDefaultStepByStartAndEnd = (start: number, end: number, maxDataPoints?: number) => {
  maxDataPoints = maxDataPoints ?? 240;
  return Math.max(Math.floor((end - start) / maxDataPoints), 1);
};

const adjustStep = (step: number, minStep: number, range: number) => {
  // Prometheus 限制最大点数是 11000
  let safeStep = range / 11000;
  if (safeStep > 1) {
    safeStep = Math.ceil(safeStep);
  }
  return Math.max(step, minStep, safeStep);
};

export const getRealStep = (time: IRawTimeRange, target: ITarget) => {
  const parsedRange = parseRange(time);
  let start = moment(parsedRange.start).unix();
  let end = moment(parsedRange.end).unix();
  let step: any = getDefaultStepByStartAndEnd(start, end, target?.maxDataPoints);
  if (target.time) {
    const parsedRange = parseRange(target.time);
    const start = moment(parsedRange.start).unix();
    const end = moment(parsedRange.end).unix();
    step = getDefaultStepByStartAndEnd(start, end, target.maxDataPoints);
  }
  if (target.step) {
    step = adjustStep(step, target.step, end - start);
  }
  return step;
};

interface Result {
  series: any[];
  query?: any[];
}

export default async function prometheusQuery(options: IOptions): Promise<Result> {
  const { dashboardId, id, time, targets, variableConfig, spanNulls, scopedVars, type } = options;
  if (!time.start) return Promise.resolve({ series: [] });
  const parsedRange = parseRange(time);
  const series: any[] = [];
  let batchQueryParams: any[] = [];
  let batchInstantParams: any[] = [];
  let exps: any[] = []; // 表达式查询条件
  let exprs: string[] = [];
  let refIds: string[] = [];
  let signalKey = `${id}`;
  const datasourceValue = variableConfig ? replaceExpressionVars(options.datasourceValue as any, variableConfig, variableConfig.length, dashboardId) : options.datasourceValue;
  if (targets && typeof datasourceValue === 'number') {
    _.forEach(targets, (target, idx) => {
      // 兼容没有 refId 数据的旧版内置大盘
      if (!target.refId) {
        target.refId = alphabet[idx];
      }
      let start = moment(parsedRange.start).unix();
      let end = moment(parsedRange.end).unix();
      if (target.time) {
        const parsedRange = parseRange(target.time);
        start = moment(parsedRange.start).unix();
        end = moment(parsedRange.end).unix();
      }
      const _step = getRealStep(time, target);

      // TODO: 消除毛刺？
      // start = start - (start % _step!);
      // end = end - (end % _step!);

      if (target.__mode__ === '__expr__') {
        exps.push({
          ref: target.refId,
          exp: target.expr,
        });
      } else {
        const realExpr = variableConfig
          ? replaceFieldWithVariable(
              dashboardId,
              target.expr,
              getOptionsList(
                {
                  dashboardId,
                  variableConfigWithOptions: variableConfig,
                },
                target.time ? target.time : time,
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
              refId: target.refId,
            });
          } else {
            if (!IS_PLUS) {
              batchQueryParams.push({
                end,
                start,
                query: realExpr,
                step: _step,
                refId: target.refId,
              });
            } else {
              batchQueryParams.push({
                ref: target.refId,
                ds_id: datasourceValue,
                ds_cate: 'prometheus',
                query: {
                  end,
                  start,
                  ql: realExpr,
                  step: _step,
                },
              });
            }
          }
          exprs.push(target.expr);
          refIds.push(target.refId);
          signalKey += `-${target.expr}`;
        }
      }
    });
    try {
      let batchQueryRes: any = {};
      if (!_.isEmpty(batchQueryParams)) {
        if (!IS_PLUS) {
          batchQueryRes = await fetchHistoryRangeBatch({ queries: batchQueryParams, datasource_id: datasourceValue }, signalKey);
          const dat = batchQueryRes.dat || [];
          for (let i = 0; i < dat?.length; i++) {
            var item = {
              result: dat[i],
              expr: batchQueryParams[i]?.query,
              refId: batchQueryParams[i]?.refId,
            };
            const target = _.find(targets, (t) => t.refId === item.refId);
            _.forEach(item.result, (serie) => {
              let _step = 15;
              if (!spanNulls) {
                if (target) {
                  _step = getRealStep(time, target);
                }
              }
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
        } else {
          batchQueryRes = await fetchHistoryRangeBatch2({ queries: batchQueryParams, exps }, signalKey);
          const dat = batchQueryRes.dat || [];
          for (let i = 0; i < dat?.length; i++) {
            const refId = dat[i]?.ref;
            const expr = _.find(batchQueryParams, { ref: dat[i]?.ref })?.ql;
            const target = _.find(targets, (t) => t.refId === refId);
            _.forEach(dat[i]?.data, (serie) => {
              let _step = 15;
              if (!spanNulls) {
                if (target) {
                  _step = getRealStep(time, target);
                }
              }
              const isExp = _.find(exps, (exp) => exp.ref === serie.ref);
              const currentTarget = _.find(targets, (target) => target.refId === serie.ref);
              if (!currentTarget?.hide) {
                series.push({
                  id: _.uniqueId('series_'),
                  refId: refId,
                  target: currentTarget,
                  isExp,
                  metric: serie.metric,
                  expr,
                  data: !spanNulls ? completeBreakpoints(_step, serie.values) : serie.values,
                });
              }
            });
          }
        }
      }
      let batchInstantRes: any = {};
      if (!_.isEmpty(batchInstantParams)) {
        batchInstantRes = await fetchHistoryInstantBatch({ queries: batchInstantParams, datasource_id: datasourceValue }, signalKey);
        const dat = batchInstantRes.dat || [];
        for (let i = 0; i < dat?.length; i++) {
          var item = {
            result: dat[i],
            expr: batchInstantParams[i]?.query,
            refId: batchInstantParams[i]?.refId,
          };
          const target = _.find(targets, (t) => t.refId === item.refId);
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
              url: `/api/${N9E_PATHNAME}/query-range-batch`,
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
              url: `/api/${N9E_PATHNAME}/query-instant-batch`,
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
