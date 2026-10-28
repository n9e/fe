import { getTooltipLegend } from './utils';
import type { BarGaugeValue } from './utils';

describe('getTooltipLegend', () => {
  const item: BarGaugeValue = { id: 'A', name: 'Resolved CPU legend', metric: { __name__: 'cpu', ident: 'host-1' }, stat: 12 };

  it('uses the resolved series name when a custom legend is configured', () => {
    expect(getTooltipLegend({ ...item, target: { refId: 'A', legend: '{{ident}} CPU' } }, 'host-1')).toBe('Resolved CPU legend');
  });

  it('keeps the custom legend when the metric is also empty', () => {
    expect(getTooltipLegend({ ...item, metric: {}, target: { refId: 'A', legend: 'CPU' } }, 'Other')).toBe('Resolved CPU legend');
  });

  it.each([undefined, { refId: 'A' }, { refId: 'A', legend: '' }])('preserves the metric tooltip when target is %p', (target) => {
    expect(getTooltipLegend({ ...item, target }, 'host-1')).toBeUndefined();
  });

  it('uses the display name for a synthesized Other item without labels', () => {
    expect(getTooltipLegend({ id: 'other', name: 'Other', metric: {}, stat: 20 }, 'Other')).toBe('Other');
  });

  it('does not invent a legend when the display name is absent', () => {
    expect(getTooltipLegend({ ...item, metric: {} })).toBeUndefined();
  });
});
