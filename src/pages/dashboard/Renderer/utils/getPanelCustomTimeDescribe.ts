import _ from 'lodash';
import { IRawTimeRange, describeTimeRange } from '@/components/TimeRangePicker';

export default function getPanelCustomTimeDescribe(
  series: {
    target: {
      time: IRawTimeRange;
    };
  }[],
) {
  if (_.isEmpty(series)) return undefined;
  const timeRanges = series.map((s) => s?.target?.time);
  const allEqual = timeRanges.every((timeRange, index, array) => {
    return index === 0 || _.isEqual(timeRange, array[0]);
  });

  if (allEqual) {
    return describeTimeRange(timeRanges[0], 'YYYY-MM-DD HH:mm:ss');
  }
  return undefined;
}
