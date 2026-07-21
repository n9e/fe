jest.mock('@/components/TimeRangePicker/RelativeTimeRangePicker/utils', () => ({
  mapRelativeTimeRangeToOption: ({ start, end }) => ({
    start: start === 300 ? 'now-5m' : start === 900 ? 'now-15m' : start,
    end: end === 0 ? 'now' : end,
  }),
}));

jest.mock('@/components/TimeRangePicker/utils', () => ({
  describeTimeRange: ({ start, end }) => {
    if (start === 'now-5m' && end === 'now') return 'Last 5 minutes';
    if (start === 'now-15m' && end === 'now') return 'Last 15 minutes';
    return `${start} ~ ${end}`;
  },
}));

import { buildHostMachinePreviewSummary, buildRuleConditionSummary, normalizeSummaryText, stringifyExpressions } from './ruleConditionSummary';

describe('ruleConditionSummary', () => {
  it('normalizes multiline query text into one line', () => {
    expect(normalizeSummaryText('fields @timestamp,\n  @message\n| limit 20')).toBe('fields @timestamp, @message | limit 20');
  });

  it('builds prometheus v1 query summary without trigger summary', () => {
    const summary = buildRuleConditionSummary({
      cate: 'prometheus',
      version: 'v1',
      queries: [{ ref: 'A', prom_ql: '1 < 0', severity: 2, unit: 'none' }],
      triggers: [{ severity: 2, exp: '$A > 0' }],
    });

    expect(summary.queries[0]).toMatchObject({
      title: 'A · Normal · P2',
      queryText: '1 < 0',
      queryPreviewType: 'promql',
    });
    expect(summary.triggers).toEqual([]);
  });

  it('builds prometheus v2 query, threshold trigger, and nodata trigger summary', () => {
    const summary = buildRuleConditionSummary({
      cate: 'prometheus',
      version: 'v2',
      queries: [{ ref: 'A', query: 'cpu_usage_idle', unit: 'none' }],
      triggers: [{ severity: 2, mode: 0, expressions: [{ ref: 'A', comparisonOperator: '<', logicalOperator: '&&', value: 0 }] }],
      nodataTrigger: {
        enable: true,
        severity: 1,
        resolve_after_enable: true,
        resolve_after: 1800,
      },
    });

    expect(summary.queries[0]).toMatchObject({
      title: 'A · Advanced',
      queryText: 'cpu_usage_idle',
      queryPreviewType: 'promql',
    });
    expect(summary.triggers[0]).toMatchObject({
      title: '#1 · P2',
      meta: [],
      valueTags: ['$A < 0'],
    });
    expect(summary.triggers[1]).toMatchObject({
      title: 'No data · P1',
      meta: ['Auto recover after 1800s'],
    });
  });

  it('builds query title with readable query range or interval', () => {
    expect(
      buildRuleConditionSummary({
        cate: 'prometheus',
        version: 'v2',
        queries: [{ ref: 'A', query: 'up', from: 300, to: 0 }],
        labels: { range: '查询区间' },
      }).queries[0].title,
    ).toBe('A · Advanced · 查询区间 Last 5 minutes');

    expect(
      buildRuleConditionSummary({
        cate: 'prometheus',
        version: 'v2',
        queries: [{ ref: 'A', query: 'up', range: { start: 'now-5m', end: 'now' } }],
        labels: { range: '查询区间' },
      }).queries[0].title,
    ).toBe('A · Advanced · 查询区间 Last 5 minutes');

    expect(
      buildRuleConditionSummary({
        cate: 'mysql',
        queries: [{ ref: 'B', sql: 'select 1', interval: 1, interval_unit: 'min' }],
      }).queries[0].title,
    ).toBe('B · Interval 1min');
  });

  it('builds cloudwatch single metric search summary without datasource type', () => {
    const summary = buildRuleConditionSummary({
      cate: 'cloudwatch',
      queries: [
        {
          ref: 'A',
          from: 300,
          to: 0,
          queries: [
            {
              query_type: 'metric_search',
              region: 'ap-southeast-2',
              namespace: 'AWS/EC2',
              metric_name: 'CPUUtilization',
              statistic: 'Minimum',
              query_id: 'id',
              alias: 'alias',
            },
          ],
        },
      ],
      labels: { range: '查询区间' },
    });

    expect(summary.queries[0]).toMatchObject({
      title: 'A · 查询区间 Last 5 minutes',
    });
    expect(summary.queries[0].meta).toEqual(['ap-southeast-2', 'AWS/EC2', 'CPUUtilization']);
    expect(summary.queries[0].queryText).toBe('');
  });

  it('builds cloudwatch multi subquery summary with only region and subquery count', () => {
    const summary = buildRuleConditionSummary({
      cate: 'cloudwatch',
      queries: [
        {
          ref: 'A',
          queries: [
            { query_type: 'metric_search', region: 'ap-southeast-2', namespace: 'AWS/EC2', metric_name: 'CPUUtilization' },
            { query_type: 'metric_search', region: 'ap-southeast-2', namespace: 'AWS/S3', metric_name: 'NumberOfObjects' },
          ],
        },
      ],
    });

    expect(summary.queries[0].meta).toEqual(['ap-southeast-2', '2 subqueries']);
  });

  it('builds cloudwatch code and metric insights summaries', () => {
    const codeSummary = buildRuleConditionSummary({
      cate: 'cloudwatch',
      queries: [
        {
          ref: 'A',
          range: { start: 'now-5m', end: 'now' },
          queries: [
            {
              query_type: 'metric_search',
              metric_editor_mode: 1,
              region: 'ap-southeast-2',
              expression: 'SEARCH("{AWS/EC2,InstanceId} MetricName=\"CPUUtilization\"", "Average", 300)',
            },
          ],
        },
      ],
      labels: { range: '查询区间' },
    });

    expect(codeSummary.queries[0]).toMatchObject({
      title: 'A · 查询区间 Last 5 minutes',
      meta: ['ap-southeast-2'],
      queryText: 'SEARCH("{AWS/EC2,InstanceId} MetricName="CPUUtilization"", "Average", 300)',
      queryPreviewType: 'text',
    });

    const sql = 'SELECT AVG(CPUUtilization)\nFROM SCHEMA("AWS/EC2", InstanceId)';
    const insightsSummary = buildRuleConditionSummary({
      cate: 'cloudwatch',
      queries: [
        {
          ref: 'B',
          from: 300,
          to: 0,
          queries: [
            {
              query_type: 'metric_insights',
              region: 'us-east-1',
              expression: sql,
            },
          ],
        },
      ],
      labels: { range: '查询区间' },
    });

    expect(insightsSummary.queries[0]).toMatchObject({
      title: 'B · 查询区间 Last 5 minutes',
      meta: ['us-east-1'],
      queryText: 'SELECT AVG(CPUUtilization) FROM SCHEMA("AWS/EC2", InstanceId)',
      queryFullText: sql,
      queryPreviewType: 'sql',
    });
  });

  it('builds cloudwatch logs summary', () => {
    const summary = buildRuleConditionSummary({
      cate: 'cloudwatchlogs',
      queries: [
        {
          ref: 'A',
          range: { start: 'now-5m', end: 'now' },
          region: 'us-east-1',
          log_group_names: ['app', 'nginx'],
          query_language: 'CWLI',
          query_string: 'fields @timestamp,\n @message | limit 20',
        },
      ],
      labels: { range: '查询区间' },
    });

    expect(summary.queries[0]).toMatchObject({
      title: 'A · 查询区间 Last 5 minutes',
      queryText: 'fields @timestamp, @message | limit 20',
      queryFullText: 'fields @timestamp,\n @message | limit 20',
      queryPreviewType: 'text',
    });
    expect(summary.queries[0].meta).toEqual(['us-east-1', '2 log groups', 'CWLI']);
  });

  it('builds gcm builder summary', () => {
    const summary = buildRuleConditionSummary({
      cate: 'gcm',
      queries: [
        {
          ref: 'A',
          query_type: 'builder',
          from: 900,
          to: 0,
          project_id: 'project-id',
          service: 'compute.googleapis.com',
          metric_type: 'compute.googleapis.com/guest/cpu/usage_time',
          group_bys: ['metric.instance_name'],
          reducer: 'REDUCE_MEAN',
          aligner: 'ALIGN_DELTA',
        },
      ],
    });

    expect(summary.queries[0]).toMatchObject({
      title: 'A · Range Last 15 minutes',
    });
    expect(summary.queries[0].meta).toEqual(['compute.googleapis.com/guest/cpu/usage_time']);
    expect(summary.queries[0].queryText).toBe('');
  });

  it('builds gcm promql summary', () => {
    const summary = buildRuleConditionSummary({
      cate: 'gcm',
      queries: [{ ref: 'A', query_type: 'promql', promql: 'rate(cpu_usage[5m])' }],
    });

    expect(summary.queries[0]).toMatchObject({
      title: 'A',
      queryText: 'rate(cpu_usage[5m])',
      queryPreviewType: 'promql',
    });
  });

  it('builds elasticsearch index and index pattern summaries', () => {
    const indexSummary = buildRuleConditionSummary({
      cate: 'elasticsearch',
      queries: [{ ref: 'A', index_type: 'index', index: 'logs-*', filter: 'status:500', interval: 1, interval_unit: 'min' }],
    });
    expect(indexSummary.queries[0]).toMatchObject({
      title: 'A · Interval 1min',
      meta: ['logs-*', 'status:500'],
    });

    const indexPatternSummary = buildRuleConditionSummary({
      cate: 'elasticsearch',
      queries: [{ ref: 'B', index_type: 'index_pattern', index_pattern_name: 'nginx-pattern', filter: 'method:GET' }],
    });
    expect(indexPatternSummary.queries[0]).toMatchObject({
      title: 'B',
      meta: ['nginx-pattern', 'method:GET'],
    });
  });

  it('builds generic sql with preserved full text and multiple trigger summaries', () => {
    const sql = 'select\n  1';
    const summary = buildRuleConditionSummary({
      cate: 'mysql',
      queries: [
        { ref: 'A', sql, unit: 'none' },
        { ref: 'B', sql: 'select 2', unit: 'none' },
      ],
      triggers: [
        { severity: 2, mode: 1, exp: '$A > 0' },
        { severity: 1, mode: 0, expressions: [{ ref: 'B', comparisonOperator: '<=', logicalOperator: '||', value: 10 }] },
      ],
    });

    expect(summary.queries.map((item) => item.queryText)).toEqual(['select 1', 'select 2']);
    expect(summary.queries[0].queryFullText).toBe(sql);
    expect(summary.queries.map((item) => item.queryPreviewType)).toEqual(['sql', 'sql']);
    expect(summary.triggers.map((item) => item.valueTags?.[0])).toEqual(['$A > 0', '$B <= 10']);
    expect(summary.triggers.map((item) => item.title)).toEqual(['#1 · P2', '#2 · P1']);
  });

  it('does not build nodata trigger when disabled', () => {
    const summary = buildRuleConditionSummary({
      cate: 'mysql',
      nodataTrigger: { enable: false, severity: 2 },
    });

    expect(summary.triggers).toEqual([]);
  });

  it('builds host trigger summaries', () => {
    const summary = buildRuleConditionSummary({
      cate: 'host',
      queries: [{ key: 'all_hosts' }],
      triggers: [
        { type: 'target_miss', severity: 2, duration: 30 },
        { type: 'pct_target_miss', severity: 1, duration: 60, percent: 80 },
        { type: 'offset', severity: 3, duration: 500 },
      ],
      labels: {
        hostThan: '超过',
        hostSecond: '秒',
        hostPctTargetMissText: '秒，失联比例超过',
        hostMillisecond: '毫秒',
        hostTriggerNames: {
          target_miss: '机器失联',
          pct_target_miss: '机器集群失联',
          offset: '机器时间偏移',
        },
      },
    });

    expect(summary.queries).toEqual([]);
    expect(summary.triggers).toMatchObject([
      { title: '机器失联 · P2', meta: [], valueTags: ['超过 30秒'] },
      { title: '机器集群失联 · P1', meta: [], valueTags: ['超过 60秒，失联比例超过', '80%'] },
      { title: '机器时间偏移 · P3', meta: [], valueTags: ['超过 500毫秒'] },
    ]);
  });

  it('stringifies multi-expression builder triggers', () => {
    expect(
      stringifyExpressions([
        { ref: 'A', comparisonOperator: '>', logicalOperator: '&&', value: 1 },
        { ref: 'B', label: 'avg', comparisonOperator: '<', value: 2 },
      ]),
    ).toBe('$A > 1 && $B.avg < 2');
  });

  it('builds host machine preview tags with extra count', () => {
    expect(
      buildHostMachinePreviewSummary(
        [
          { ident: 'host-a' },
          { ident: 'host-b' },
          { ident: 'host-c' },
        ],
        5,
        3,
      ),
    ).toEqual({
      names: ['host-a', 'host-b', 'host-c'],
      extraCount: 2,
    });
  });

  it('ignores failed or empty host machine preview data', () => {
    expect(buildHostMachinePreviewSummary([], 0, 3)).toEqual({
      names: [],
      extraCount: 0,
    });
  });
});
