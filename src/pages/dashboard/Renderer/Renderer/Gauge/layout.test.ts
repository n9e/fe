import { calculateGaugeLayout } from './layout';

describe('calculateGaugeLayout', () => {
  it('fits every gauge in a single horizontal row', () => {
    const layout = calculateGaugeLayout(500, 200, 2, 4, 'horizontal');

    expect(layout).toHaveLength(4);
    expect(layout.every((item) => item.top === 0 && item.height === 200)).toBe(true);
    expect(layout[0].left).toBe(0);
    expect(layout[3].left + layout[3].width).toBeCloseTo(500);
  });

  it('fits every gauge in a single vertical column', () => {
    const layout = calculateGaugeLayout(200, 500, 2, 4, 'vertical');

    expect(layout).toHaveLength(4);
    expect(layout.every((item) => item.left === 0 && item.width === 200)).toBe(true);
    expect(layout[0].top).toBe(0);
    expect(layout[3].top + layout[3].height).toBeCloseTo(500);
  });

  it('uses the Stat square-grid algorithm for auto layout without exceeding the panel', () => {
    const parentWidth = 600;
    const parentHeight = 400;
    const layout = calculateGaugeLayout(parentWidth, parentHeight, 2, 7, 'auto');

    expect(layout).toHaveLength(7);
    layout.forEach((item) => {
      expect(item.left).toBeGreaterThanOrEqual(0);
      expect(item.top).toBeGreaterThanOrEqual(0);
      expect(item.left + item.width).toBeLessThanOrEqual(parentWidth + 0.001);
      expect(item.top + item.height).toBeLessThanOrEqual(parentHeight + 0.001);
    });
  });

  it('returns no items for an empty or unmeasured panel', () => {
    expect(calculateGaugeLayout(0, 200, 2, 3, 'auto')).toEqual([]);
    expect(calculateGaugeLayout(200, 200, 2, 0, 'vertical')).toEqual([]);
  });
});
