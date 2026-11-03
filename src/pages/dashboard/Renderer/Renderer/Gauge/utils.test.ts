import {
  getFormattedThresholds,
  getGaugeContentWidth,
  getGaugeNameMaxLength,
  getGaugeTextOffsets,
  getGaugeThresholdLabelAngle,
  getGaugeThresholdLabelAnchor,
  getGaugeThresholdLabelOrientation,
  getGaugeThresholdLabelRadius,
  getGaugeValueFontSize,
} from './utils';

describe('getFormattedThresholds', () => {
  it('converts percentage threshold values into the gauge range', () => {
    expect(
      getFormattedThresholds(
        {
          mode: 'percentage',
          steps: [
            { type: 'base', value: null, color: 'green' },
            { value: 50, color: 'yellow' },
          ],
        },
        20,
        220,
      ),
    ).toEqual([
      { start: 0, end: 100, color: 'green' },
      { start: 100, end: 200, color: 'yellow' },
    ]);
  });
});

describe('gauge text and label geometry', () => {
  it('separates the circular 0% and 100% labels around the top of the ring', () => {
    const startAngle = getGaugeThresholdLabelAngle(0, 0, true);
    const endAngle = getGaugeThresholdLabelAngle(1, Math.PI * 2, true);

    expect(startAngle).toBeCloseTo(0.15);
    expect(endAngle).toBeCloseTo(Math.PI * 2 - 0.15);
    expect(getGaugeThresholdLabelAngle(0.6, (Math.PI * 2 * 60) / 100, true)).toBeCloseTo((Math.PI * 2 * 60) / 100);
  });

  it('keeps every arc threshold label at the same close radius outside the threshold arc', () => {
    const thresholdOuterRadius = 82;
    const halfLabelFontSize = 9 / 2;
    const radii = [0, 0.6, 0.8, 1].map(() => getGaugeThresholdLabelRadius());

    expect(new Set(radii).size).toBe(1);
    expect(radii[0]).toBe(86.5);
    expect(radii[0] - thresholdOuterRadius).toBeGreaterThanOrEqual(halfLabelFontSize);
  });

  it('anchors 0 and the trailing percent to their respective arc endpoints', () => {
    expect(getGaugeThresholdLabelAnchor(0)).toBe('start');
    expect(getGaugeThresholdLabelAnchor(0.6)).toBe('middle');
    expect(getGaugeThresholdLabelAnchor(0.8)).toBe('middle');
    expect(getGaugeThresholdLabelAnchor(1)).toBe('end');
    expect(getGaugeThresholdLabelAnchor(0, true)).toBe('middle');
  });

  it('keeps both endpoint labels in natural reading order', () => {
    const start = getGaugeThresholdLabelOrientation((-115 * Math.PI) / 180);
    const nearStart = getGaugeThresholdLabelOrientation((-103.5 * Math.PI) / 180);
    const middle = getGaugeThresholdLabelOrientation((23 * Math.PI) / 180);
    const nearEnd = getGaugeThresholdLabelOrientation((69 * Math.PI) / 180);
    const beforeEnd = getGaugeThresholdLabelOrientation((103.5 * Math.PI) / 180);
    const end = getGaugeThresholdLabelOrientation((115 * Math.PI) / 180);
    const arcStart = getGaugeThresholdLabelOrientation((-115 * Math.PI) / 180, true);
    const arcEnd = getGaugeThresholdLabelOrientation((115 * Math.PI) / 180, true);

    expect(start.rotation).toBeCloseTo(65);
    expect(start.glyphRotation).toBe(0);
    expect(nearStart.rotation).toBeCloseTo(76.5);
    expect(nearStart.glyphRotation).toBe(0);
    expect(middle.rotation).toBeCloseTo(23);
    expect(middle.glyphRotation).toBe(0);
    expect(nearEnd.rotation).toBeCloseTo(69);
    expect(nearEnd.glyphRotation).toBe(0);
    expect(beforeEnd.rotation).toBeCloseTo(-76.5);
    expect(beforeEnd.glyphRotation).toBe(0);
    expect(end.rotation).toBeCloseTo(-65);
    expect(end.glyphRotation).toBe(0);
    expect(getGaugeThresholdLabelOrientation((288 * Math.PI) / 180).rotation).toBeCloseTo(-72);
    expect(arcStart.rotation).toBeCloseTo(-115);
    expect(arcStart.glyphRotation).toBe(0);
    expect(arcEnd.rotation).toBeCloseTo(115);
    expect(arcEnd.glyphRotation).toBe(0);
  });

  it('keeps the circular gauge label radius unchanged', () => {
    expect(getGaugeThresholdLabelRadius(true)).toBe(90);
  });

  it('shrinks value, name, and sparkline widths as the bar leaves less inner space', () => {
    const normalInnerRadius = 52;
    const thickBarInnerRadius = 40;

    expect(getGaugeValueFontSize(thickBarInnerRadius, 9)).toBeLessThan(getGaugeValueFontSize(normalInnerRadius, 9));
    expect(getGaugeNameMaxLength(thickBarInnerRadius)).toBeLessThan(getGaugeNameMaxLength(normalInnerRadius));
    expect(getGaugeContentWidth(thickBarInnerRadius)).toBeLessThan(getGaugeContentWidth(normalInnerRadius));
  });

  it('keeps the value and name closer while retaining a safe gap for larger values', () => {
    const longValueOffsets = getGaugeTextOffsets(14, true, true);
    const shortValueOffsets = getGaugeTextOffsets(24, true, true);

    expect(longValueOffsets.name - longValueOffsets.value).toBeLessThan(15);
    expect(shortValueOffsets.name - shortValueOffsets.value).toBeGreaterThan(longValueOffsets.name - longValueOffsets.value);
  });
});
