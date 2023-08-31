import _ from 'lodash';
import moment from 'moment';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { DatasourceCateEnum } from '@/utils/constant';
import { getDsQuery } from '@/plugins/TDengine/services';
import { IVariable } from '@/pages/dashboard/VariableConfig/definition';
import replaceExpressionBracket from '@/pages/dashboard/Renderer/utils/replaceExpressionBracket';
import { replaceExpressionVars } from '@/pages/dashboard/VariableConfig/constant';
import { getSerieName } from '../utils';

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

export default async function prometheusQuery(options: IOptions): Promise<Result> {
  const { dashboardId, time, targets, variableConfig } = options;
  if (!time.start) return Promise.resolve({ series: [] });
  const parsedRange = parseRange(time);
  const start = moment(parsedRange.start).unix();
  const end = moment(parsedRange.end).unix();
  const series: any[] = [];
  let refIds: string[] = [];
  const datasourceValue = variableConfig ? replaceExpressionVars(options.datasourceValue as any, variableConfig, variableConfig.length, dashboardId) : options.datasourceValue;
  if (targets && typeof datasourceValue === 'number') {
    _.forEach(targets, (target) => {
      refIds.push(target.refId);
    });
    const queryParmas = {
      cate: DatasourceCateEnum.tdengine,
      datasource_id: datasourceValue,
      query: _.map(targets, (target) => {
        const query: any = target.query || {};
        return {
          from: start,
          to: end,
          query: query.query,
          keys: query.keys,
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
            url: '/api/n9e/query-range-batch',
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
