import _ from 'lodash';
import moment from 'moment';

import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { DatasourceCateEnum } from '@/utils/constant';
import replaceTemplateVariables from '@/pages/dashboard/Variables/utils/replaceTemplateVariables';

import { getDsQuery2, getLogsQuery } from '../services';

interface IOptions {
  id?: string; // panelId
  datasourceValue: number;
  time: IRawTimeRange;
  targets: any[];
  spanNulls?: boolean;
  scopedVars?: any;
  inspect?: boolean;
  custom: any;
  queryOptionsTime?: IRawTimeRange; // 2025-10-20 新增， queryOptionsTime 会覆盖 time
}

interface Result {
  series: any[];
  query?: any[];
}

export default async function dorisQuery(options: IOptions): Promise<Result> {
  const { time, targets, datasourceValue, queryOptionsTime } = options;
  if (!time.start) return Promise.resolve({ series: [] });
  const parsedRange = parseRange(time);
  let start = moment(parsedRange.start).unix();
  let end = moment(parsedRange.end).unix();
  let batchTimeSeriesParams: any[] = [];
  let batchRawParams: any[] = [];
  let exps: any[] = []; // 表达式查询条件
  let series: any[] = [];
  if (targets && typeof datasourceValue === 'number') {
    _.forEach(targets, (target) => {
      if (queryOptionsTime) {
        const parsedRange = parseRange(queryOptionsTime);
        start = moment(parsedRange.start).unix();
        end = moment(parsedRange.end).unix();
      }
      const query: any = target.query || {};
      const queryStr = replaceTemplateVariables(query.query);
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
        if (query.queryStrategy === 'query') {
          batchRawParams.push({
            ref: target.refId,
            ds_id: datasourceValue,
            ds_cate: DatasourceCateEnum.doris,
            query: {
              mode: 'query',
              from: start,
              to: end,
              offset: 0,
              lines: 500,
              query: queryStr,
              reverse: true,
              table: query.table,
              database: query.database,
              time_field: query.time_field,
            },
          });
        } else if (query.queryStrategy === 'sql') {
          if (!query.query) return;
          if (mode === 'timeSeries') {
            batchTimeSeriesParams.push({
              ref: target.refId,
              ds_id: datasourceValue,
              ds_cate: DatasourceCateEnum.doris,
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
            batchRawParams.push({
              ref: target.refId,
              ds_id: datasourceValue,
              ds_cate: DatasourceCateEnum.doris,
              query: {
                ref: target.refId,
                mode: 'sql',
                from: start,
                to: end,
                sql: queryStr,
              },
            });
          }
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
    if (!_.isEmpty(batchRawParams)) {
      rawRes = await getLogsQuery({
        queries: batchRawParams,
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
            mode: 'timeSeries',
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
            mode: 'raw',
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
            url: `/api/n9e-plus/ds-query`,
            method: 'POST',
            data: batchTimeSeriesParams,
          },
          response: seriesRes,
        });
      }
      if (!_.isEmpty(batchRawParams)) {
        resolveData.query.push({
          type: 'Logs',
          request: {
            url: `/api/n9e-plus/logs-query`,
            method: 'POST',
            data: batchRawParams,
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
