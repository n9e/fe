import { shouldShowSeriesInTooltip } from './tooltipFilter';

describe('tooltipPlugin 过滤逻辑 (shouldShowSeriesInTooltip)', () => {
  describe('主数据数组过滤 (无 n9e_internal.values)', () => {
    it('应排除 value 为 null 的项', () => {
      const seriesItem = { show: true };
      const values = [null, 42];
      expect(shouldShowSeriesInTooltip(seriesItem, values, 0)).toBe(false);
      expect(shouldShowSeriesInTooltip(seriesItem, values, 1)).toBe(true);
    });

    it('应排除 value 为 undefined 的项', () => {
      const seriesItem = { show: true };
      const values = [undefined, 42];
      expect(shouldShowSeriesInTooltip(seriesItem, values, 0)).toBe(false);
      expect(shouldShowSeriesInTooltip(seriesItem, values, 1)).toBe(true);
    });

    it('应保留 value 为 0 或正常数值的项', () => {
      const seriesItem = { show: true };
      const values = [0, -1, 3.14];
      expect(shouldShowSeriesInTooltip(seriesItem, values, 0)).toBe(true);
      expect(shouldShowSeriesInTooltip(seriesItem, values, 1)).toBe(true);
      expect(shouldShowSeriesInTooltip(seriesItem, values, 2)).toBe(true);
    });

    it('应排除 show 为 false 的项，不论 value', () => {
      const seriesItem = { show: false };
      const values = [100];
      expect(shouldShowSeriesInTooltip(seriesItem, values, 0)).toBe(false);
    });
  });

  describe('n9e_internal.values 覆盖 (堆叠图场景)', () => {
    it('当 n9e_internal.values 存在时，应基于原始值判断', () => {
      const seriesItem = {
        show: true,
        n9e_internal: {
          values: [undefined, 100],
        },
      };
      const values = [50, 100];
      expect(shouldShowSeriesInTooltip(seriesItem, values, 0)).toBe(false);
      expect(shouldShowSeriesInTooltip(seriesItem, values, 1)).toBe(true);
    });

    it('当 n9e_internal.values 某位置为 null 时也应排除', () => {
      const seriesItem = {
        show: true,
        n9e_internal: {
          values: [null, 200],
        },
      };
      const values = [50, 200];
      expect(shouldShowSeriesInTooltip(seriesItem, values, 0)).toBe(false);
      expect(shouldShowSeriesInTooltip(seriesItem, values, 1)).toBe(true);
    });
  });

  describe('边界情况', () => {
    it('n9e_internal 存在但 values 为 undefined 时应退回到主数据', () => {
      const seriesItem = { show: true, n9e_internal: {} };
      const values = [42];
      expect(shouldShowSeriesInTooltip(seriesItem, values, 0)).toBe(true);
    });

    it('n9e_internal 不存在时应使用主数据', () => {
      const seriesItem = { show: true };
      const values = [undefined, 99];
      expect(shouldShowSeriesInTooltip(seriesItem, values, 0)).toBe(false);
      expect(shouldShowSeriesInTooltip(seriesItem, values, 1)).toBe(true);
    });
  });
});
