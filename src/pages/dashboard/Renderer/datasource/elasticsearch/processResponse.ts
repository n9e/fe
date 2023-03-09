import _ from 'lodash';
import { ITarget } from '../../../types';

function processAggregations(aggregations: any[], seriesList: any[], metric: { [index: string]: string }, hasCountFunc: boolean) {
  let aggId;
  for (aggId in aggregations) {
    const buckets = aggregations[aggId].buckets;
    if (aggId === 'date') {
      const subAggs = _.omit(buckets[0], ['key', 'key_as_string', 'doc_count']);
      if (hasCountFunc) {
        seriesList.push({
          name: 'count',
          metric: _.cloneDeep(metric),
          data: [],
        });
      }
      _.forEach(subAggs, (_subAgg, subAggId) => {
        seriesList.push({
          name: subAggId,
          metric: _.cloneDeep(metric),
          data: [],
        });
      });
    }
    _.forEach(buckets, (bucket) => {
      const { key, doc_count } = bucket;
      const subAggs = _.omit(bucket, ['key', 'key_as_string', 'doc_count']) as any[];
      if (aggId === 'date') {
        _.forEach(subAggs, (subAgg, subAggId) => {
          const { value } = subAgg;
          const series = _.find(seriesList, (s) => s.name === subAggId);
          if (series) {
            series.data.push([key / 1000, value]);
          }
        });
        if (hasCountFunc) {
          const series = _.find(seriesList, (s) => s.name === 'count');
          if (series) {
            series.data.push([key / 1000, doc_count]);
          }
        }
      } else {
        metric[aggId] = key;
        processAggregations(subAggs, seriesList, metric, hasCountFunc);
      }
    });
  }
}

function hasCountFunc(target: { values: { func: string }[] }) {
  return _.some(target?.values, (m) => m.func === 'count');
}

export function processResponseToSeries(responses: any[], params: any[]) {
  const seriesList: any[] = [];
  _.forEach(responses, (response, idx: number) => {
    const { aggregations } = response;
    processAggregations(aggregations, seriesList, {}, hasCountFunc(params[idx]));
  });

  return seriesList;
}
