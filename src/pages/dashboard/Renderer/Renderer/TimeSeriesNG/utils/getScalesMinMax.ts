import { Range } from 'uplot';
import moment from 'moment';
import _ from 'lodash';

import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';

import { IPanel } from '../../../../types';

import getStartAndEndByTargets from './getStartAndEndByTargets';

interface Props {
  range?: IRawTimeRange;
  panel: IPanel;
}

export default function getScalesXMinMaxAndYRange(props: Props) {
  const { range, panel } = props;
  const { options = {}, targets } = panel;
  let xMinMax: Range.MinMax | undefined = undefined;
  let yRange: Range.MinMax | undefined = undefined;
  if (range) {
    const parsedRange = parseRange(range);
    const startAndEnd = getStartAndEndByTargets(targets);
    const start = startAndEnd.start || moment(parsedRange.start).unix();
    const end = startAndEnd.end || moment(parsedRange.end).unix();
    xMinMax = [start, end];
  }
  if (_.isNumber(options.standardOptions?.min)) {
    yRange = [options.standardOptions?.min, null];
  }
  if (_.isNumber(options.standardOptions?.max)) {
    yRange = [yRange ? yRange[0] : null, options.standardOptions?.max];
  }

  return {
    xMinMax,
    yRange,
  };
}
