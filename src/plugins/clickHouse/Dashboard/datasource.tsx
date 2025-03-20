import _ from 'lodash';
import moment from 'moment';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { DatasourceCateEnum } from '@/utils/constant';
import { IVariable } from '@/pages/dashboard/VariableConfig/definition';
import replaceFieldWithVariable from '@/pages/dashboard/Renderer/utils/replaceFieldWithVariable';
import { getDsQuery2, getLogsQuery } from '../services';

interface IOptions {
  id?: string; // panelId
  dashboardId: string;
  datasourceValue: number;
  time: IRawTimeRange;
  targets: any[];
  variableConfig?: IVariable[];
  spanNulls?: boolean;
  scopedVars?: any;
  inspect?: boolean;
}

interface Result {
  series: any[];
  query?: any[];
}

export default async function mysqlQuery(options: IOptions): Promise<Result> {
  const { dashboardId, time, targets, variableConfig, datasourceValue } = options;
  if (!time.start) return Promise.resolve({ series: [] });
  const parsedRange = parseRange(time);
  let start = moment(parsedRange.start).unix();
  let end = moment(parsedRange.end).unix();
  let batchTimeSeriesParams: any[] = [];
  let batchTimeRawParams: any[] = [];
  let exps: any[] = []; // 表达式查询条件
  let series: any[] = [];
  if (targets && typeof datasourceValue === 'number') {
    _.forEach(targets, (target) => {
      if (target.time) {
        const parsedRange = parseRange(target.time);
        start = moment(parsedRange.start).unix();
        end = moment(parsedRange.end).unix();
      }
      const query: any = target.query || {};
      if (!query.query) return;
      const queryStr = variableConfig ? replaceFieldWithVariable(dashboardId, query.query, variableConfig) : query.query;
      const mode = query.mode;
      if (target.__mode__ === '__expr__') {
        exps.push({
          ref: target.refId,
          exp: target.expr,
        });
      } else {
        if (_.isArray(query?.keys?.valueKey)) {
          query.keys.valueKey = _.join(query.keys.valueKey, ' ');
        }
        if (_.isArray(query?.keys?.labelKey)) {
          query.keys.labelKey = _.join(query.keys.labelKey, ' ');
        }
        if (mode === 'timeSeries') {
          batchTimeSeriesParams.push({
            ref: target.refId,
            ds_id: datasourceValue,
            ds_cate: DatasourceCateEnum.ck,
            query: {
              ref: target.refId,
              from: start,
              to: end,
              sql: queryStr,
              keys: {
                valueKey: _.isArray(query.keys?.valueKey) ? _.join(query.keys?.valueKey, ' ') : query.keys?.valueKey,
                labelKey: _.isArray(query.keys?.labelKey) ? _.join(query.keys?.labelKey, ' ') : query.keys?.labelKey,
              },
            },
          });
        } else if (mode === 'raw') {
          batchTimeRawParams.push({
            ref: target.refId,
            ds_id: datasourceValue,
            ds_cate: DatasourceCateEnum.ck,
            query: {
              ref: target.refId,
              from: start,
              to: end,
              sql: queryStr,
            },
          });
        }
      }
    });
    let seriesRes;
    if (!_.isEmpty(batchTimeSeriesParams)) {
      seriesRes = await getDsQuery2({
        queries: batchTimeSeriesParams,
        exps,
      });
    }
    let rawRes;
    if (!_.isEmpty(batchTimeRawParams)) {
      rawRes = await getLogsQuery({
        queries: batchTimeRawParams,
      });
    }

    for (let i = 0; i < seriesRes?.length; i++) {
      const { data, ref } = seriesRes?.[i];
      _.forEach(data, (serie) => {
        const isExp = _.find(exps, (exp) => exp.ref === serie.ref);
        const currentTarget = _.find(targets, (target) => target.refId === serie.ref);
        if (!currentTarget?.hide) {
          series.push({
            id: _.uniqueId('series_'),
            refId: ref,
            target: currentTarget,
            isExp,
            metric: serie.metric,
            data: serie.values,
          });
        }
      });
    }
    const raw = _.flatten(
      _.map(rawRes, (item) => {
        const currentTarget = _.find(targets, (target) => target.refId === item?.ref);
        return _.map(item?.data, (subItem) => {
          return {
            id: _.uniqueId('series_'),
            target: currentTarget,
            metric: subItem,
            data: [],
          };
        });
      }),
    );
    const resolveData: Result = { series: _.concat(series, raw) };
    if (options.inspect) {
      resolveData.query = [];
      if (!_.isEmpty(batchTimeSeriesParams)) {
        resolveData.query.push({
          type: 'TimeSeries',
          request: {
            url: `/api/n9e/ds-query`,
            method: 'POST',
            data: batchTimeSeriesParams,
          },
          response: seriesRes,
        });
      }
      if (!_.isEmpty(batchTimeRawParams)) {
        resolveData.query.push({
          type: 'Logs',
          request: {
            url: `/api/n9e/logs-query`,
            method: 'POST',
            data: batchTimeRawParams,
          },
          response: raw,
        });
      }
    }
    return Promise.resolve(resolveData);
  }
  return Promise.resolve({
    series: [],
  });
}
