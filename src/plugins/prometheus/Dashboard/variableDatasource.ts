import moment from 'moment';
import _ from 'lodash';

import { getLabelNames, getMetricSeries, getMetricSeriesV2, getLabelValues, getMetric, getQueryResult } from '@/services/dashboardV2';
import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';
import { Props } from '@/pages/dashboard/Variables/datasource';

export default async function variableDatasource(
  props: Props<{
    range?: IRawTimeRange;
    query?: string;
  }>,
) {
  const { datasourceValue, datasourceList, query } = props;
  const queryValue = query.query;
  const range = query.range;
  let options: string[] = [];

  if (queryValue && range) {
    const parsedRange = parseRange(range);
    const start = moment(parsedRange.start).unix();
    const end = moment(parsedRange.end).unix();
    const expression = _.trim(queryValue);

    if (expression === 'label_names()') {
      return getLabelNames({ start, end }, datasourceValue).then((res) => res.data);
    } else if (expression.startsWith('label_values(')) {
      if (expression.includes(',')) {
        let metricsAndLabel = expression.substring('label_values('.length, expression.length - 1).split(',');
        const label = metricsAndLabel.pop();
        const metric = metricsAndLabel.join(', ');
        const currentDatasource = _.find(datasourceList, { id: datasourceValue });
        // 如果查询时间小于一天并且开始时间在一天内并且是 VictoriaMetrics 类型的时序库，可能存在数据延迟，需要使用 last_over_time 查询
        if (
          end - start < 86400 &&
          end >= moment().subtract(1, 'day').unix() &&
          (currentDatasource?.settings?.['prometheus.tsdb_type'] === 'VictoriaMetrics' || currentDatasource?.settings?.tsdb_type === 'VictoriaMetrics')
        ) {
          return getMetricSeriesV2({ metric, start, end }, datasourceValue).then((res) =>
            _.without(Array.from(new Set(_.map(res.data, (item) => item[_.trim(label)]))), undefined),
          );
        }
        return getMetricSeries({ 'match[]': metric.trim(), start, end }, datasourceValue).then((res) =>
          _.without(Array.from(new Set(_.map(res.data, (item) => item[_.trim(label)]))), undefined),
        );
      } else {
        const label = expression.substring('label_values('.length, expression.length - 1);
        return getLabelValues(label, { start, end }, datasourceValue).then((res) => res.data);
      }
    } else if (expression.startsWith('metrics(')) {
      const metricRegexStr = expression.substring('metrics('.length, expression.length - 1);
      return getMetric({ start, end }, datasourceValue).then((res) =>
        _.filter(res.data, (item) => {
          // 2024-07-24 这里需要对 metricRegexStr 进行正则匹配
          return item.match(new RegExp(metricRegexStr));
        }),
      );
    } else if (expression.startsWith('query_result(')) {
      let promql = expression.substring('query_result('.length, expression.length - 1);
      return getQueryResult({ query: promql, start, end }, datasourceValue).then((res) => {
        if (res?.data?.resultType === 'matrix') {
          return [];
        }
        return _.map(res?.data?.result, ({ metric, value }) => {
          const metricName = metric['__name__'];
          const labels = Object.keys(metric)
            .filter((ml) => ml !== '__name__')
            .map((label) => `${label}="${metric[label]}"`);
          const values = value.join(' ');
          return `${metricName || ''} {${labels}} ${values}`;
        });
      });
    } else {
      return getQueryResult({ query: expression, start, end }, datasourceValue).then((res) => {
        if (res?.data?.resultType === 'matrix') {
          return [];
        }
        return _.map(res?.data?.result, ({ metric, value }) => {
          const metricName = metric['__name__'];
          const labels = Object.keys(metric)
            .filter((ml) => ml !== '__name__')
            .map((label) => `${label}="${metric[label]}"`);
          const values = value.join(' ');
          return `${metricName || ''} {${labels}} ${values}`;
        });
      });
    }
  }
  return Promise.resolve(options);
}
