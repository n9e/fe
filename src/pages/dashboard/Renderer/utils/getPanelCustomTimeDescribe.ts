import _ from 'lodash';
import { IRawTimeRange, describeTimeRange } from '@/components/TimeRangePicker';

export default function getPanelCustomTimeDescribe(time?: IRawTimeRange) {
  if (time) {
    return describeTimeRange(time, 'YYYY-MM-DD HH:mm:ss');
  }
  return undefined;
}
