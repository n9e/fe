import _ from 'lodash';
import moment from 'moment';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { DatasourceCateEnum } from '@/utils/constant';
import { getDsQuery } from '@/plugins/TDengine/services';
import replaceExpressionBracket from '@/pages/dashboard/Renderer/utils/replaceExpressionBracket';
import { getSerieName } from '../utils';
import { N9E_PATHNAME } from '@/utils/constant';
interface IOptions {
  id?: string; // panelId
  datasourceValue: number;
  time: IRawTimeRange;
  targets: any[];
  spanNulls?: boolean;
  scopedVars?: any;
  inspect?: boolean;
}

interface Result {
  series: any[];
  query?: any[];
}

export default async function prometheusQuery(options: IOptions): Promise<Result> {
  const { time, targets, datasourceValue } = options;
  if (!time.start) return Promise.resolve({ series: [] });
  const parsedRange = parseRange(time);
  let start = moment(parsedRange.start).toISOString();
  let end = moment(parsedRange.end).toISOString();
  const series: any[] = [];
  let refIds: string[] = [];
  if (targets && typeof datasourceValue === 'number') {
    _.forEach(targets, (target) => {
      refIds.push(target.refId);
    });
    const queryParmas = {
      cate: DatasourceCateEnum.tdengine,
      datasource_id: datasourceValue,
      query: _.map(targets, (target) => {
        if (target.time) {
          const parsedRange = parseRange(target.time);
          start = moment(parsedRange.start).toISOString();
          end = moment(parsedRange.end).toISOString();
        }
        const query: any = target.query || {};
        return {
          from: start,
          to: end,
          query: query.query,
          keys: {
            metricKey: _.join(query.keys?.metricKey, ' '),
            labelKey: _.join(query.keys?.labelKey, ' '),
            timeFormat: query.keys?.timeFormat,
          },
        };
      }),
    };
    try {
      let batchQueryRes: any = {};
      if (!_.isEmpty(targets) && _.some(targets, (target) => target.query?.query)) {
        batchQueryRes = await getDsQuery(queryParmas);
        for (let i = 0; i < batchQueryRes?.length; i++) {
          const target = _.find(targets, (t) => t.refId === refIds[i]);
          _.forEach(batchQueryRes, (serie) => {
            series.push({
              id: _.uniqueId('series_'),
              name: target?.legend ? replaceExpressionBracket(target?.legend, serie.metric) : getSerieName(serie.metric),
              metric: serie.metric,
              data: serie.values,
            });
          });
        }
      }
      const resolveData: Result = { series };
      if (options.inspect) {
        resolveData.query = [];
        resolveData.query.push({
          type: 'Query Range',
          request: {
            url: `/api/${N9E_PATHNAME}/query-range-batch`,
            method: 'POST',
            data: queryParmas,
          },
          response: batchQueryRes,
        });
      }
      return Promise.resolve(resolveData);
    } catch (e) {
      console.error(e);
      return Promise.reject(e);
    }
  }
  return Promise.resolve({
    series: [],
  });
}
