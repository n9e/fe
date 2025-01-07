import _ from 'lodash';

export const getColumnsKeys = (data: any[]) => {
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
    throw new Error('min should be less than max');
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
