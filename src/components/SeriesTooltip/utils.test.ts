import { getSeriesTooltipContent, hasSeriesTooltipContent } from './utils';

describe('getSeriesTooltipContent', () => {
  it('uses __name__ as the title, preserves label order, and omits nullish labels', () => {
    const metrics = Object.freeze({ ident: 'host-1', __name__: 'cpu_usage', empty: '', zero: 0, missing: undefined, unset: null });

    expect(getSeriesTooltipContent({ metrics, value: '12%' })).toEqual({
      title: 'cpu_usage',
      value: '12%',
      labels: [
        { key: 'ident', value: 'host-1' },
        { key: 'empty', value: '' },
        { key: 'zero', value: '0' },
      ],
    });
    expect(metrics).toEqual({ ident: 'host-1', __name__: 'cpu_usage', empty: '', zero: 0, missing: undefined, unset: null });
  });

  it('prefers the resolved legend over the metric name and labels', () => {
    expect(getSeriesTooltipContent({ metrics: { __name__: 'cpu_usage', ident: 'host-1' }, legend: 'host-1 cpu', value: 0 })).toEqual({
      title: 'host-1 cpu',
      value: '0',
      labels: [],
    });
  });

  it('falls back to metrics when the legend is empty', () => {
    expect(getSeriesTooltipContent({ metrics: { __name__: 'cpu', ident: 'host-1' }, legend: '' })).toEqual({
      title: 'cpu',
      value: undefined,
      labels: [{ key: 'ident', value: 'host-1' }],
    });
  });

  it('supports metrics without a name and numeric metric names', () => {
    expect(getSeriesTooltipContent({ metrics: { ident: 'host-1' } })).toEqual({ title: undefined, value: undefined, labels: [{ key: 'ident', value: 'host-1' }] });
    expect(getSeriesTooltipContent({ metrics: { __name__: 0 } })).toEqual({ title: '0', value: undefined, labels: [] });
  });

  it.each([
    [undefined, undefined],
    ['', undefined],
    [0, '0'],
    ['0', '0'],
    [-1.25, '-1.25'],
    ['12 ms', '12 ms'],
  ])('normalizes value %p to %p', (value, expected) => {
    expect(getSeriesTooltipContent({ value })).toEqual({ title: undefined, value: expected, labels: [] });
  });
});

describe('hasSeriesTooltipContent', () => {
  it.each([
    [{}, false],
    [{ metrics: { __name__: '', missing: null, unset: undefined }, value: '' }, false],
    [{ legend: 'cpu' }, true],
    [{ value: 0 }, true],
    [{ metrics: { ident: '' } }, true],
  ])('detects displayable content in %p', (params, expected) => {
    expect(hasSeriesTooltipContent(getSeriesTooltipContent(params))).toBe(expected);
  });
});
