import _ from 'lodash';
import moment from 'moment';
import semver from 'semver';

import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { getDsQuery, getESVersion } from '@/services/warning';
import { fetchHistoryRangeBatch2 } from '@/services/dashboardV2';
import { flattenHits } from '@/pages/explorer/Elasticsearch/utils';
import { N9E_PATHNAME, IS_PLUS } from '@/utils/constant';
import { getESIndexPatterns } from '@/pages/log/IndexPatterns/services';

import { ITarget } from '../../../types';
import { IVariable } from '../../../VariableConfig/definition';
import { replaceExpressionVars } from '../../../VariableConfig/constant';
import { getSeriesQuery, getLogsQuery } from './queryBuilder';
import { processResponseToSeries } from './processResponse';
import { normalizeInterval } from './utils';

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
  const { id, dashboardId, time, targets, variableConfig, datasourceValue } = options;
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
      if (query.index_type === 'index_pattern') {
        return !query.index_pattern;
      }
      return !query.index || !query.date_field;
    },
  );
  const hasIndexPattern = _.some(targets, (target) => target.query?.index_type === 'index_pattern');
  const indexPatterns = hasIndexPattern ? await getESIndexPatterns(datasourceValue) : [];
  if (targets && datasourceValue && !isInvalid) {
    _.forEach(targets, (target) => {
      if (target.time) {
        const parsedRange = parseRange(target.time);
        start = moment(parsedRange.start).valueOf();
        end = moment(parsedRange.end).valueOf();
      }
      const query: any = target.query || {};
      const filter = variableConfig
        ? replaceExpressionVars({
            text: query.filter,
            variables: variableConfig,
            limit: variableConfig.length,
            dashboardId,
          })
        : query.filter;
      if (target.__mode__ === '__expr__') {
        exps.push({
          ref: target.refId,
          exp: target.expr,
        });
      } else {
        if (isRawDataQuery(target)) {
          batchLogParams.push({
            index_type: query.index_type || 'index',
            index: query.index,
            index_pattern: query.index_pattern,
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
              index_type: query.index_type || 'index',
              index: query.index,
              index_pattern: query.index_pattern,
              filter,
              syntax: query.syntax,
              values: query?.values,
              group_by: query.group_by,
              date_field: query.date_field,
              interval: `${normalizeInterval(parsedRange, query.interval, query.interval_unit)}s`,
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
                  index_type: query.index_type || 'index',
                  index: query.index,
                  index_pattern: query.index_pattern,
                  filter,
                  syntax: query.syntax,
                  value: item,
                  group_by: query.group_by,
                  date_field: query.date_field,
                  interval: normalizeInterval(parsedRange, query.interval, query.interval_unit),
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
          if (semver.gte(version, '7.17.0')) {
            intervalkey = 'fixed_interval';
          }
        } catch (e) {
          console.error(new Error('get es version error'));
        }

        _.forEach(batchDsParams, (item) => {
          if (item.index_type === 'index_pattern') {
            const currentIndexPattern = _.find(indexPatterns, { id: item.index_pattern });
            item.index = currentIndexPattern?.name;
            item.date_field = currentIndexPattern?.time_field;
          }
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
      _.forEach(batchLogParams, async (item) => {
        if (item.index_type === 'index_pattern') {
          const currentIndexPattern = _.find(indexPatterns, { id: item.index_pattern });
          item.index = currentIndexPattern?.name;
          item.date_field = currentIndexPattern?.time_field;
        }
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
      // TODO: 暂时以第一个查询条件是否配置 date_format 为准，如果配置了 date_format 则所有日志的 date_field 值都会去格式化
      let dateField = _.get(targets, '[0].query.date_field');
      if (_.get(targets, '[0].query.index_type') === 'index_pattern') {
        dateField = _.get(_.find(indexPatterns, { id: _.get(targets, '[0].query.index_pattern') }), 'time_field');
      }

      const dateFormat = _.get(targets, '[0].query.date_format');
      _.forEach(logRes, (item) => {
        const { docs } = flattenHits(item?.hits?.hits);
        _.forEach(docs, (doc: any) => {
          if (dateField && dateFormat) {
            _.set(doc, `fields.${dateField}`, moment(doc?.fields?.[dateField]).format(dateFormat));
          }
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
