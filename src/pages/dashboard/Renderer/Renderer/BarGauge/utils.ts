import _ from 'lodash';
import type { ITarget, IThresholds } from '../../../types';
import type { CalculatedSeries } from '../../utils/getCalculatedValuesBySeries';

export interface BarGaugeValue {
  id: string;
  name?: string;
  metric: Record<string, string | undefined>;
  target?: ITarget;
  stat: number;
  value?: string;
  unit?: string;
  color?: string;
}

/** 配置了自定义 legend 或没有标签（如合并出的 Other 项）时，tooltip 直接展示名称 */
export const getTooltipLegend = (item: BarGaugeValue, displayName?: string) => {
  if (item.target?.legend) return item.name;
  if (_.isEmpty(item.metric)) return displayName;
  return undefined;
};

export const getColumnsKeys = (data: CalculatedSeries[]) => {
  const keys = _.reduce(
    data,
    (result, item) => {
      return _.union(result, _.keys(item.metric));
    },
    [],
  );
  return _.uniq(keys);
};

export function calculatePercentage(value: number, min: number, max: number): number {
  if (min > max) {
    console.error('min should be less than max');
    return 0;
  }
  if (min === max) {
    return 100;
  }
  if (value < min) {
    return 0;
  }
  if (value > max) {
    return 100;
  }
  return ((value - min) / (max - min)) * 100;
}

/** 按阈值构造连续色带。 */
export function getGradientBackground(thresholds: IThresholds | undefined, min: number, max: number, fallback: string, direction = 'to right'): string {
  const steps = _.sortBy(thresholds?.steps ?? [], (step) => (step.value === null ? Number.NEGATIVE_INFINITY : step.value));
  if (steps.length === 0 || min === max) return fallback;
  const stops = steps.map((step, index) => {
    const rawValue = step.value === null ? min : thresholds?.mode === 'percentage' ? min + (max - min) * (step.value / 100) : step.value;
    const position = index === 0 ? 0 : calculatePercentage(rawValue as number, min, max);
    return `${step.color} ${Math.max(0, Math.min(100, position))}%`;
  });
  return `linear-gradient(${direction}, ${stops.join(', ')})`;
}
