import _ from 'lodash';

export type TestFireStageStatus = 'pass' | 'warn' | 'fail' | 'skip';

export interface TestFireStage {
  stage: string;
  status: TestFireStageStatus;
  data?: Record<string, any>;
}

export interface SampleSeries {
  labels: Record<string, string>;
  value: number;
  labelStr: string;
}

/**
 * 默认模拟级别：取规则里配置的最高级别（数值最小），没有则回退 S2。
 * 级别按数据源形态可能配在 queries（Prometheus V1/Host/Loki）或 triggers（ES/SQL 插件、Prometheus V2）里
 */
export function getDefaultSeverity(ruleConfig: any): number {
  const candidates = _.concat(_.map(_.get(ruleConfig, 'queries'), 'severity'), _.map(_.get(ruleConfig, 'triggers'), 'severity'));
  const severities = _.filter(candidates, (item) => _.includes([1, 2, 3], item));
  const min = _.min(severities);
  return typeof min === 'number' ? min : 2;
}

/**
 * 按规则版本读取第一条非空查询表达式：V2（高级模式）存在 queries[].query，V1 存在 prom_ql。
 * 只读 prom_ql 会让 V2 规则取不到查询，误判为「查询无数据」。
 */
export function getFirstPromql(ruleConfig: any): string | undefined {
  const field = _.get(ruleConfig, 'version') === 'v2' ? 'query' : 'prom_ql';
  return _.find(_.map(_.get(ruleConfig, 'queries'), field), (v) => !!v) as string | undefined;
}

/** 把 Prometheus instant query 的 vector 结果解析成样本序列选项 */
export function parseVectorSeries(promResp: any): SampleSeries[] {
  if (!promResp || promResp.resultType !== 'vector' || !_.isArray(promResp.result)) return [];
  return _.compact(
    _.map(promResp.result, (item) => {
      const value = _.toNumber(_.get(item, ['value', 1]));
      if (!_.isFinite(value)) return undefined;
      const metric = item?.metric || {};
      const name = metric.__name__ || '';
      const labelPairs = _.map(
        _.omitBy(metric, (val, key) => _.startsWith(key, '__')),
        (val, key) => `${key}=${val}`,
      );
      return {
        labels: metric,
        value,
        labelStr: `${name}{${labelPairs.join(', ')}}`,
      };
    }),
  );
}

export interface NotifySummary {
  matched: number;
  sent: number;
  failed: number;
  notMatched: number;
}

/** 汇总通知段各渠道的匹配/发送结果，供报告标题行展示 */
export function summarizeNotifyResults(results: any[]): NotifySummary {
  const summary: NotifySummary = { matched: 0, sent: 0, failed: 0, notMatched: 0 };
  _.forEach(results, (item) => {
    if (item?.matched) {
      summary.matched += 1;
      if (item.sent) {
        summary.sent += 1;
      } else if (item.error) {
        summary.failed += 1;
      }
    } else {
      summary.notMatched += 1;
    }
  });
  return summary;
}
