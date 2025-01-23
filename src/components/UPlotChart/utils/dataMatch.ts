import _ from 'lodash';

export default function dataMatch(lhs: uPlot.AlignedData, rhs: uPlot.AlignedData): boolean {
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
}
