import { Range } from 'uplot';
import moment from 'moment';
import _ from 'lodash';

import { IRawTimeRange, parseRange } from '@/components/TimeRangePicker';

import { IPanel } from '../../../../types';

interface Props {
  range?: IRawTimeRange;
  queryOptionsTime?: IRawTimeRange;
}

export function getScalesXMinMax(props: Props) {
  const { range, queryOptionsTime } = props;
  let xMinMax: Range.MinMax | undefined = undefined;
  if (range) {
    const parsedRange = parseRange(range);
    let start = moment(parsedRange.start).unix();
    let end = moment(parsedRange.end).unix();
    if (queryOptionsTime) {
      const startAndEnd = parseRange(queryOptionsTime);
      start = moment(startAndEnd.start).unix();
      end = moment(startAndEnd.end).unix();
    }
    xMinMax = [start, end];
  }
  return xMinMax;
}

export function getScalesYRange(props: { panel: IPanel }) {
  const { panel } = props;
  const { options = {} } = panel;
  let yRange: Range.MinMax | undefined = undefined;
  if (_.isNumber(options.standardOptions?.min)) {
    yRange = [options.standardOptions?.min!, null];
  }
  if (_.isNumber(options.standardOptions?.max)) {
    yRange = [yRange ? yRange[0] : null, options.standardOptions?.max!];
  }

  return yRange;
}
