export const legacyPromTimeseries = {
  version: '3.4.0',
  panels: [{ id: 'panel-1', version: '3.4.0', type: 'timeseries', datasourceCate: 'prometheus', datasourceValue: 1, targets: [{ expr: 'up' }], custom: {}, options: {} }],
} as const;

export const legacyPromWithExpression = {
  version: '3.4.0',
  panels: [{ id: 'panel-expression', version: '3.4.0', type: 'timeseries', datasourceCate: 'prometheus', datasourceValue: 1, targets: [{ expr: 'up' }, { __mode__: '__expr__', expr: '$A * 100' }], custom: {}, options: {} }],
} as const;

export const legacyEsPanel = {
  version: '3.4.0',
  panels: [{ id: 'panel-es', version: '3.4.0', type: 'tableNG', datasourceCate: 'elasticsearch', datasourceValue: 2, targets: [{ query: { index: 'logs-*', date_field: '@timestamp', syntax: 'kuery', values: [{ func: 'count' }, { func: 'avg', field: 'duration' }] } }], custom: {}, options: {} }],
} as const;

export const legacyBarGaugeV3 = {
  panels: [{ id: 'bar-gauge', version: '3.0.0', type: 'barGauge', custom: { maxValue: 100, baseColor: 'green' }, options: {}, targets: [] }],
} as const;

export const legacyRowDashboard = {
  panels: [{ id: 'row', version: '3.1.0', type: 'row', panels: [{ id: 'nested', type: 'timeseries', targets: [{ expr: 'up' }], custom: {}, options: {} }] }],
} as const;

export const mixedV4Dashboard = {
  version: '4.0.0',
  panels: [{ id: 'mixed', version: '4.0.0', type: 'timeseries', datasourceCate: 'mixed', datasourceValue: 'mixed', targets: [{ refId: 'A', kind: 'query', datasource: { cate: 'prometheus', id: 1 }, expr: 'up' }, { refId: 'B', kind: 'query', datasource: { cate: 'prometheus', id: 2 }, expr: 'up' }], custom: {}, options: {} }],
} as const;
