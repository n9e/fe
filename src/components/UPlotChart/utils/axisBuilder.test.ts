import uPlot from 'uplot';

jest.mock('@/utils/constant', () => ({
  FONT_FAMILY: 'PingFang SC',
  THEME: {
    light: { text: { primary: '#333' } },
    dark: { text: { primary: '#fff' } },
  },
}));

import { calculateAxisSize, formatTime } from './axisBuilder';

const UTC = 'utc';

// UTC 时间戳（秒）
const TS = {
  '2025-01-01': 1735689600,
  '2025-06-01_12:30:45': 1748781045,
  '2025-12-01': 1764547200,
  '2025-12-30': 1767052800,
  '2025-12-31': 1767139200,
  '2025-12-31_12:00': 1767182400,
  '2026-01-01': 1767225600,
  '2026-01-01_01:00': 1767229200,
  '2026-01-01_02:00': 1767232800,
  '2026-01-01_12:00': 1767268800,
  '2026-01-02': 1767312000,
} as const;

const DAY = 86400;

const buildSelf = (axisOverrides: Record<string, unknown> = {}) =>
  ({
    axes: [{ timeZone: UTC, rotate: 0, ...axisOverrides }],
  }) as unknown as uPlot;

describe('UPlotChart formatTime', () => {
  test('日粒度刻度跨年时，首个刻度和跨年刻度第二行补充年份', () => {
    const result = formatTime(
      buildSelf(),
      [TS['2025-12-30'], TS['2025-12-31'], TS['2026-01-01'], TS['2026-01-02']],
      0,
      40,
      DAY,
    );
    expect(result).toEqual(['12-30\n2025', '12-31', '01-01\n2026', '01-02']);
  });

  test('月粒度刻度跨年时同样补充年份', () => {
    const result = formatTime(buildSelf(), [TS['2025-12-01'], TS['2026-01-01']], 0, 40, 31 * DAY);
    expect(result).toEqual(['12-01\n2025', '01-01\n2026']);
  });

  test('小时粒度刻度不显示年份', () => {
    const result = formatTime(buildSelf(), [TS['2026-01-01_01:00'], TS['2026-01-01_02:00']], 0, 40, 3600);
    expect(result).toEqual(['01:00', '02:00']);
  });

  test('2 天范围小时刻度跨年：首个日界刻度与跨年日界刻度补充年份', () => {
    const result = formatTime(
      buildSelf(),
      [TS['2025-12-31'], TS['2025-12-31_12:00'], TS['2026-01-01'], TS['2026-01-01_12:00']],
      0,
      40,
      4 * 3600,
    );
    expect(result).toEqual(['12-31\n2025', '12:00', '01-01\n2026', '12:00']);
  });

  test('未跨年的轴不补充年份（含首个日界刻度）', () => {
    const result = formatTime(buildSelf(), [TS['2025-12-30'], TS['2025-12-31']], 0, 40, DAY);
    expect(result).toEqual(['12-30', '12-31']);
  });

  test('刻度增量达到年级别时，整轴只显示年份', () => {
    const result = formatTime(buildSelf(), [TS['2025-01-01'], TS['2026-01-01']], 0, 40, 365 * DAY);
    expect(result).toEqual(['2025', '2026']);
  });

  test('旋转标签时不使用两行格式', () => {
    const result = formatTime(
      buildSelf({ rotate: 90 }),
      [TS['2025-12-30'], TS['2026-01-01']],
      0,
      40,
      DAY,
    );
    expect(result).toEqual(['12-30', '01-01']);
  });

  test('带秒的刻度显示 HH:mm:ss，并按时区判断', () => {
    const result = formatTime(buildSelf(), [TS['2025-06-01_12:30:45']], 0, 40, 3600);
    expect(result).toEqual(['12:30:45']);
  });

  test('UTC 零点刻度按轴时区显示 MM-DD（而非浏览器本地时间）', () => {
    const result = formatTime(buildSelf(), [TS['2025-12-31_12:00'], TS['2026-01-01']], 0, 40, DAY * 2);
    expect(result[1]).toContain('01-01\n2026');
    expect(result[0]).toBe('12:00');
  });
});

describe('UPlotChart calculateAxisSize', () => {
  const buildAxis = () =>
    ({
      ticks: { size: 4 },
      gap: 5,
      side: 2,
    }) as unknown as uPlot.Axis;

  test('单行刻度保持原有轴高度', () => {
    const axis = buildAxis();
    const self = { axes: [axis] } as unknown as uPlot;
    const size = calculateAxisSize(self, ['12-30', '01-01'], 0);
    expect(size).toBe(4 + 5 + 12);
  });

  test('含两行刻度时按行数扩展轴高度', () => {
    const axis = buildAxis();
    const self = { axes: [axis] } as unknown as uPlot;
    const size = calculateAxisSize(self, ['12-30', '01-01\n2026'], 0);
    expect(size).toBe(4 + 5 + 12 * 2 + 6);
  });

  test('values 为 null（首轮布局）时按单行计算', () => {
    const axis = buildAxis();
    const self = { axes: [axis] } as unknown as uPlot;
    const size = calculateAxisSize(self, null, 0);
    expect(size).toBe(4 + 5 + 12);
  });
});
