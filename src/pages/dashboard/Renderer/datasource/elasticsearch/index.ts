import _ from 'lodash';
import moment from 'moment';
import semver from 'semver';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { getDsQuery, getESVersion } from '@/services/warning';
import { normalizeTime } from '@/pages/alertRules/utils';
import { fetchHistoryRangeBatch2 } from '@/services/dashboardV2';
import { ITarget } from '../../../types';
import { IVariable } from '../../../VariableConfig/definition';
import { replaceExpressionVars } from '../../../VariableConfig/constant';
import { getSeriesQuery, getLogsQuery } from './queryBuilder';
import { processResponseToSeries } from './processResponse';
import { flattenHits } from '@/pages/explorer/Elasticsearch/utils';
import { N9E_PATHNAME, IS_PLUS } from '@/utils/constant';

interface IOptions {
  dashboardId: string;
  datasourceValue: number;
  id?: string;
  time: IRawTimeRange;
  targets: ITarget[];
  variableConfig?: IVariable[];
  inspect?: boolean;
}

/**
 * 根据 target 判断是否为查询 raw data
 */
function isRawDataQuery(target: ITarget) {
  if (_.size(target.query?.values) === 1) {
    const func = _.get(target, ['query', 'values', 0, 'func']);
    return func === 'rawData';
  }
  return false;
}

interface Result {
  series: any[];
  query?: any[];
}

export default async function elasticSearchQuery(options: IOptions): Promise<Result> {
  const { id, dashboardId, time, targets, variableConfig } = options;
  if (!time.start) return Promise.resolve({ series: [] });
  const parsedRange = parseRange(time);
  let start = moment(parsedRange.start).valueOf();
  let end = moment(parsedRange.end).valueOf();
  let batchDsParams: any[] = [];
  let batchLogParams: any[] = [];
  let exps: any[] = [];
  let series: any[] = [];
  let signalKey = `${id}`;
  const isInvalid = _.some(
    _.filter(targets, (item) => {
      return item.__mode__ !== '__expr__';
    }),
    (target) => {
      const query: any = target.query || {};
      return !query.index || !query.date_field;
    },
  );
  const datasourceValue = variableConfig
    ? (replaceExpressionVars(options.datasourceValue as any, variableConfig, variableConfig.length, dashboardId) as any)
    : options.datasourceValue;
  if (targets && datasourceValue && !isInvalid) {
    _.forEach(targets, (target) => {
      if (target.time) {
        const parsedRange = parseRange(target.time);
        start = moment(parsedRange.start).valueOf();
        end = moment(parsedRange.end).valueOf();
      }
      const query: any = target.query || {};
      const filter = variableConfig ? replaceExpressionVars(query.filter, variableConfig, variableConfig.length, dashboardId) : query.filter;
      if (target.__mode__ === '__expr__') {
        exps.push({
          ref: target.refId,
          exp: target.expr,
        });
      } else {
        if (isRawDataQuery(target)) {
          batchLogParams.push({
            index: query.index,
            filter,
            syntax: query.syntax,
            date_field: query.date_field,
            limit: query.limit,
            start,
            end,
          });
        } else {
          if (!IS_PLUS) {
            batchDsParams.push({
              index: query.index,
              filter,
              syntax: query.syntax,
              values: query?.values,
              group_by: query.group_by,
              date_field: query.date_field,
              interval: `${normalizeTime(query.interval, query.interval_unit)}s`,
              start,
              end,
            });
          } else {
            _.map(query?.values, (item) => {
              batchDsParams.push({
                ref: target.refId,
                ds_id: datasourceValue,
                ds_cate: 'elasticsearch',
                query: {
                  ref: target.refId,
                  index: query.index,
                  filter,
                  syntax: query.syntax,
                  value: item,
                  group_by: query.group_by,
                  date_field: query.date_field,
                  interval: normalizeTime(query.interval, query.interval_unit),
                  start: moment(parsedRange.start).unix(),
                  end: moment(parsedRange.end).unix(),
                },
              });
            });
          }
        }
      }
      signalKey += target.refId;
    });
    let dsRes;
    let dsPlayload = '';
    if (!_.isEmpty(batchDsParams)) {
      if (!IS_PLUS) {
        let intervalkey = 'interval';
        try {
          const version = await getESVersion(datasourceValue);
          if (semver.gte(version, '8.0.0')) {
            intervalkey = 'fixed_interval';
          }
        } catch (e) {
          console.error(new Error('get es version error'));
        }
        _.forEach(batchDsParams, (item) => {
          const esQuery = JSON.stringify(getSeriesQuery(item, intervalkey));
          const header = JSON.stringify({
            search_type: 'query_then_fetch',
            ignore_unavailable: true,
            index: item.index,
          });
          dsPlayload += header + '\n';
          dsPlayload += esQuery + '\n';
        });
        dsRes = await getDsQuery(datasourceValue, dsPlayload);
        series = _.map(processResponseToSeries(dsRes, batchDsParams), (item) => {
          return {
            id: _.uniqueId('series_'),
            ...item,
          };
        });
      } else {
        dsRes = await fetchHistoryRangeBatch2({ queries: batchDsParams, exps }, signalKey);
        const dat = dsRes.dat || [];
        for (let i = 0; i < dat?.length; i++) {
          const refId = dat[i]?.ref;
          _.forEach(dat[i]?.data, (serie) => {
            const isExp = _.find(exps, (exp) => exp.ref === serie.ref);
            const currentTarget = _.find(targets, (target) => target.refId === serie.ref);
            if (!currentTarget?.hide) {
              series.push({
                id: _.uniqueId('series_'),
                refId: refId,
                target: currentTarget,
                isExp,
                metric: serie.metric,
                data: serie.values,
              });
            }
          });
        }
      }
    }
    let logRes;
    let logPlayload = '';
    if (!_.isEmpty(batchLogParams)) {
      _.forEach(batchLogParams, (item) => {
        const esQuery = JSON.stringify(getLogsQuery(item));
        const header = JSON.stringify({
          search_type: 'query_then_fetch',
          ignore_unavailable: true,
          index: item.index,
        });
        logPlayload += header + '\n';
        logPlayload += esQuery + '\n';
      });
      logRes = await getDsQuery(datasourceValue, logPlayload);
      _.forEach(logRes, (item) => {
        const { docs } = flattenHits(item?.hits?.hits);
        _.forEach(docs, (doc: any) => {
          series.push({
            id: doc._id,
            name: doc._index,
            metric: doc.fields,
            data: [],
          });
        });
      });
    }
    const resolveData: Result = { series };
    if (options.inspect) {
      resolveData.query = [];
      if (!_.isEmpty(batchDsParams)) {
        resolveData.query.push({
          type: 'TimeSeries',
          request: {
            url: `/api/${N9E_PATHNAME}/proxy/${datasourceValue}/_msearch`,
            method: 'POST',
            data: dsPlayload,
          },
          response: dsRes,
        });
      }
      if (!_.isEmpty(batchLogParams)) {
        resolveData.query.push({
          type: 'Logs',
          request: {
            url: `/api/${N9E_PATHNAME}/proxy/${datasourceValue}/_msearch`,
            method: 'POST',
            data: logPlayload,
          },
          response: logRes,
        });
      }
    }
    return Promise.resolve(resolveData);
  }
  return Promise.resolve({
    series: [],
  });
}
