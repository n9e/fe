import { Scales, Scale, Range } from 'uplot';
import _ from 'lodash';

interface Props {
  xRange?: Range.MinMax;
  yRange?: Range.MinMax;
  yDistr?: Scale.Distr;
  yLog?: Scale.LogBase;
}

export default function scalesBuilder(props: Props) {
  const { xRange, yRange, yDistr, yLog = 10 } = props;
  const scalesOptions: Scales = {};
  if (xRange) {
    scalesOptions.x = {
      min: xRange[0] ?? undefined,
      max: xRange[1] ?? undefined,
    };
  }
  if (yRange) {
    scalesOptions.y = {
      min: yRange[0] ?? undefined,
      max: yRange[1] ?? undefined,
    };
  }
  if (yDistr) {
    scalesOptions.y = scalesOptions.y || {};
    scalesOptions.y.distr = yDistr;
    scalesOptions.y.log = yLog;
  }
  return scalesOptions;
}
