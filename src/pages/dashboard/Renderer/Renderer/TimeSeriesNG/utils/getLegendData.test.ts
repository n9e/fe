import getLegendData from './getLegendData';
import { getLegendValues } from '../../../utils/getCalculatedValuesBySeries';
import type { BaseSeriesItem } from './getDataFrameAndBaseSeries';
import type { IOverride } from '../../../../types';

const baseSeries: BaseSeriesItem[] = ['A', 'B'].map((refId) => ({
  show: true,
  label: `QA_${refId}`,
  n9e_internal: { id: refId, refId, metric: {} },
}));
const standardOptions = { unit: 'percent', decimals: 2, displayName: 'QA_DISPLAY' };
const overrides: IOverride[] = [{ matcher: { id: 'byFrameRefID', value: 'A' }, properties: { standardOptions: { unit: 'none', decimals: 1, displayName: 'QA_OVERRIDE' } } }];

it('resolves names and formats independently for each legend series', () => {
  const data = getLegendData({ frames: [[1000], [10.125], [30.567]], baseSeries, hexPalette: ['red'], standardOptions, overrides });
  expect(data.map((item) => item.name)).toEqual(['QA_OVERRIDE', 'QA_DISPLAY']);
  for (const field of ['last', 'min', 'max', 'avg', 'sum'] as const) {
    expect(String(data[0][field].text)).toBe('10.1');
    expect(data[1][field].text).toBe('30.57%');
  }
  expect(baseSeries.map((item) => item.label)).toEqual(['QA_A', 'QA_B']);
});

it('inherits unspecified formats and keeps original names when displayName is absent', () => {
  const data = getLegendData({
    frames: [[1000], [10.125], [30.567]],
    baseSeries,
    hexPalette: [],
    standardOptions: { unit: 'percent', decimals: 2 },
    overrides: [{ matcher: { id: 'byFrameRefID', value: 'A' }, properties: { standardOptions: { decimals: 0 } } }],
  });
  expect(data.map((item) => item.name)).toEqual(['QA_A', 'QA_B']);
  expect(data.map((item) => item.last.text)).toEqual(['10%', '30.57%']);
});

it('keeps legacy timeseries legend formatting isolated as well', () => {
  const series = baseSeries.map((item, i) => ({
    id: item.n9e_internal.id,
    refId: item.n9e_internal.refId,
    name: item.label,
    metric: {},
    data: [[1000, [10.125, 30.567][i]] as [number, number]],
  }));
  const data = getLegendValues(series, standardOptions, ['red'], false, undefined, overrides);
  expect(data.map((item) => item.name)).toEqual(['QA_OVERRIDE', 'QA_DISPLAY']);
  expect(data.map((item) => String(item.last.text))).toEqual(['10.1', '30.57%']);
});
