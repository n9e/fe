import _ from 'lodash';
import type { CalculatedSeries } from '../../utils/getCalculatedValuesBySeries';

export interface BarGaugeValue {
  id: string;
  name?: string;
  metric: Record<string, string | undefined>;
  stat: number;
  value?: string;
  unit?: string;
  color?: string;
}

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
