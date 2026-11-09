import moment from 'moment';

import type { ITarget } from '@/pages/dashboard/types';

import { buildDashboardQueryRequest, BuildDashboardQueryRequestOptions } from './contract';

jest.mock('@/utils/constant', () => ({
  DatasourceCateEnum: { prometheus: 'prometheus', elasticsearch: 'elasticsearch', ck: 'ck', mysql: 'mysql', doris: 'doris' },
}));

jest.mock('@/utils/momentLocale', () => ({}));

jest.mock('@/components/TimeRangePicker', () => ({
  parseRange: jest.requireActual('@/components/TimeRangePicker/utils').parseRange,
}));

jest.mock('@/pages/dashboard/utils', () => ({
  getDefaultStepByTime: () => 15,
}));

jest.mock('@/pages/dashboard/globalState', () => ({
  getGlobalState: (key: string) =>
    key === 'variablesWithOptions'
      ? [
          { name: 'A', value: '999' },
          { name: '__range_ms', value: 'incorrect' },
        ]
      : undefined,
}));

jest.mock('@/pages/dashboard/Variables/plugins', () => ({
  getDashboardVariablePlugin: () => undefined,
}));

const time = { start: moment.utc('2026-11-09T00:00:00.000Z'), end: moment.utc('2026-11-09T01:00:00.000Z') };

function buildExpression(expression: string, options: Partial<BuildDashboardQueryRequestOptions> = {}, target: Partial<ITarget> = {}) {
  return buildDashboardQueryRequest({
    time,
    datasourceList: [],
    targets: [
      { refId: 'A', datasource: { cate: 'prometheus', id: 1 }, expr: 'up' },
      { refId: 'B', kind: 'expression', expression, ...target },
    ],
    ...options,
  }).queries.find((query) => query.ref_id === 'B');
}

describe('dashboard expression built-in variables', () => {
  it.each([
    ['__interval', '15s'],
    ['__interval_ms', '15000'],
    ['__range', '3600s'],
    ['__range_s', '3600'],
    ['__range_ms', '3600000'],
    ['__rate_interval', '60s'],
    ['__from', String(time.start.valueOf())],
    ['__from_date_seconds', String(time.start.unix())],
    ['__from_date_iso', '2026-11-09T00:00:00.000Z'],
    ['__to', String(time.end.valueOf())],
    ['__to_date_seconds', String(time.end.unix())],
    ['__to_date_iso', '2026-11-09T01:00:00.000Z'],
  ])('interpolates ${%s} without changing query references', (name, expected) => {
    expect(buildExpression('$A + ${' + name + '}')).toMatchObject({ expression: `$A + ${expected}` });
    expect(buildExpression('$A + len("${' + name + '}")')).toMatchObject({ expression: `$A + len("${expected}")` });
  });

  it('preserves duration units and leaves ISO timestamp quoting to the expression', () => {
    expect(buildExpression('$A / ${__interval} + ${__rate_interval} + ${__range}')).toMatchObject({ expression: '$A / 15s + 60s + 3600s' });
    expect(buildExpression('date(${__from_date_iso}) < date(${__to_date_iso})')).toMatchObject({
      expression: 'date(2026-11-09T00:00:00.000Z) < date(2026-11-09T01:00:00.000Z)',
    });
  });

  it('preserves formatted values inside single, double and raw string literals', () => {
    expect(buildExpression('duration("${__interval}").Seconds() + duration(\'${__rate_interval}\').Seconds() + len(`${__from_date_iso}`) + ${__range}')).toMatchObject({
      expression: 'duration("15s").Seconds() + duration(\'60s\').Seconds() + len(`2026-11-09T00:00:00.000Z`) + 3600s',
    });
    expect(buildExpression('len("escaped \\" quote ${__interval}") + ${__interval}')).toMatchObject({ expression: 'len("escaped \\" quote 15s") + 15s' });
  });

  it('uses the panel query time override for both range and interval', () => {
    const queryOptionsTime = { start: time.start.clone().add(2, 'hours'), end: time.start.clone().add(4, 'hours') };
    expect(buildExpression('${__from} + ${__to} + ${__range_ms} + ${__interval_ms}', { queryOptionsTime, maxDataPoints: 100, panelWidth: 1000 })).toMatchObject({
      expression: `${queryOptionsTime.start.valueOf()} + ${queryOptionsTime.end.valueOf()} + 7200000 + 72000`,
    });
  });

  it('uses panel width when maxDataPoints is absent and respects min step', () => {
    expect(buildExpression('${__interval} + ${__rate_interval}', { panelWidth: 100 })).toMatchObject({ expression: '36s + 144s' });
    expect(buildExpression('${__interval} + ${__rate_interval}', { panelWidth: 100 }, { step: 60 })).toMatchObject({ expression: '60s + 240s' });
  });

  it('supports bare and bracketed built-in variables without replacing longer unknown names', () => {
    expect(buildExpression('$A + $__interval_ms + [[__range_ms]] + ${__interval_unknown} + $__range_unknown')).toMatchObject({
      expression: '$A + 15000 + 3600000 + ${__interval_unknown} + $__range_unknown',
    });
  });

  it('interpolates legacy expression targets', () => {
    expect(buildExpression('', {}, { kind: undefined, __mode__: '__expr__', expression: undefined, expr: '$A / (${__interval_ms} / 1000)' })).toMatchObject({
      expression: '$A / (15000 / 1000)',
    });
  });

  it('still rejects unknown query references after interpolation', () => {
    expect(() => buildExpression('$MISSING / ${__interval_ms}')).toThrow('Expression dependency not found: MISSING');
  });
});
