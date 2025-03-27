import _ from 'lodash';
import { parseRange } from '@/components/TimeRangePicker';

export default function getStartAndEndByTargets(targets: any[]) {
  let start = undefined as number | undefined;
  let end = undefined as number | undefined;
  _.forEach(targets, (target) => {
    if (target.time) {
      const { start: targetStart, end: targetEnd } = parseRange(target.time);
      if (!start || targetStart?.unix()! < start) {
        start = targetStart?.unix()!;
      }
      if (!end || targetEnd?.unix()! > end) {
        end = targetEnd?.unix()!;
      }
    }
  });
  return { start, end };
}
