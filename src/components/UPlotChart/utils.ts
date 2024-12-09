import uPlot from 'uplot';
import _ from 'lodash';

type OptionsUpdateState = 'keep' | 'update' | 'create';

export const optionsUpdateState = (_lhs: uPlot.Options, _rhs: uPlot.Options): OptionsUpdateState => {
  const { width: lhsWidth, height: lhsHeight, ...lhs } = _lhs;
  const { width: rhsWidth, height: rhsHeight, ...rhs } = _rhs;

  let state: OptionsUpdateState = 'keep';
  if (lhsHeight !== rhsHeight || lhsWidth !== rhsWidth) {
    state = 'update';
  }
  if (_.keys(lhs).length !== _.keys(rhs).length) {
    return 'create';
  }
  for (const k of _.keys(lhs)) {
    if (!_.isEqual(lhs[k], rhs[k])) {
      state = 'create';
      break;
    }
  }
  return state;
};

export const dataMatch = (lhs: uPlot.AlignedData, rhs: uPlot.AlignedData): boolean => {
  if (lhs.length !== rhs.length) {
    return false;
  }
  return _.every(lhs, (lhsOneSeries, seriesIdx) => {
    const rhsOneSeries = rhs[seriesIdx];
    if (lhsOneSeries.length !== rhsOneSeries.length) {
      return false;
    }
    return _.every(lhsOneSeries, (value: number, valueIdx: number) => value === rhsOneSeries[valueIdx]);
  });
};
