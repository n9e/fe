import _ from 'lodash';
import moment from 'moment';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { getDsQuery } from '@/services/warning';
import { normalizeTime } from '@/pages/alertRules/utils';
import { ITarget } from '../../../types';
import { IVariable } from '../../../VariableConfig/definition';
import { replaceExpressionVars } from '../../../VariableConfig/constant';
import { getSeriesQuery, getLogsQuery } from './queryBuilder';
import { processResponseToSeries } from './processResponse';
import { flattenHits } from '@/pages/explorer/Elasticsearch/utils';

interface IOptions {
  dashboardId: string;
  datasourceCate: string;
  datasourceValue: number;
  id?: string;
  time: IRawTimeRange;
  targets: ITarget[];
  variableConfig?: IVariable[];
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

export default async function elasticSearchQuery(options: IOptions) {
  const { dashboardId, time, targets, datasourceCate, datasourceValue, variableConfig } = options;
  if (!time.start) return;
  const parsedRange = parseRange(time);
  let start = moment(parsedRange.start).valueOf();
  let end = moment(parsedRange.end).valueOf();
  let batchDsParams: any[] = [];
  let batchLogParams: any[] = [];
  let series: any[] = [];
  const isInvalid = _.some(targets, (target) => {
    const query: any = target.query || {};
    return !query.index || !query.date_field;
  });
  if (targets && datasourceValue && !isInvalid) {
    _.forEach(targets, (target) => {
      const query: any = target.query || {};
      const filter = variableConfig ? replaceExpressionVars(query.filter, variableConfig, variableConfig.length, dashboardId) : query.filter;
      if (isRawDataQuery(target)) {
        batchLogParams.push({
          index: query.index,
          filter,
          date_field: query.date_field,
          limit: query.limit,
          start,
          end,
        });
      } else {
        batchDsParams.push({
          index: query.index,
          filter,
          values: query?.values,
          group_by: query.group_by,
          date_field: query.date_field,
          interval: `${normalizeTime(query.interval, query.interval_unit)}s`,
          start,
          end,
        });
      }
    });
    if (!_.isEmpty(batchDsParams)) {
      let payload = '';
      _.forEach(batchDsParams, (item) => {
        const esQuery = JSON.stringify(getSeriesQuery(item));
        const header = JSON.stringify({
          search_type: 'query_then_fetch',
          ignore_unavailable: true,
          index: item.index,
        });
        payload += header + '\n';
        payload += esQuery + '\n';
      });
      const res = await getDsQuery(datasourceValue, payload);
      series = _.map(processResponseToSeries(res, batchDsParams), (item) => {
        return {
          id: _.uniqueId('series_'),
          ...item,
        };
      });
    }
    if (!_.isEmpty(batchLogParams)) {
      let payload = '';
      _.forEach(batchLogParams, (item) => {
        const esQuery = JSON.stringify(getLogsQuery(item));
        const header = JSON.stringify({
          search_type: 'query_then_fetch',
          ignore_unavailable: true,
          index: item.index,
        });
        payload += header + '\n';
        payload += esQuery + '\n';
      });
      const res = await getDsQuery(datasourceValue, payload);
      _.forEach(res, (item) => {
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
  }
  return series;
}
