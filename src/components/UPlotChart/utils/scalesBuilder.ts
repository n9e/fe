import { Scales, Scale, Range } from 'uplot';
import _ from 'lodash';

interface Props {
  xMinMax?: Range.MinMax;
  yMinMax?: Range.MinMax;
  yRange?: Range.MinMax;
  yDistr?: Scale.Distr;
  yLog?: Scale.LogBase;
}

export default function scalesBuilder(props: Props) {
  const { xMinMax, yMinMax, yRange, yDistr, yLog = 10 } = props;
  const scalesOptions: Scales = {};
  if (xMinMax) {
    scalesOptions.x = {
      min: xMinMax[0] ?? undefined,
      max: xMinMax[1] ?? undefined,
    };
  }
  if (yMinMax) {
    scalesOptions.y = {
      min: yMinMax[0] ?? undefined,
      max: yMinMax[1] ?? undefined,
    };
  }
  if (yRange) {
    scalesOptions.y = {
      range: yRange,
    };
  }
  if (yDistr) {
    scalesOptions.y = scalesOptions.y || {};
    scalesOptions.y.distr = yDistr;
    scalesOptions.y.log = yLog;
  }
  scalesOptions.y2 = {};
  return scalesOptions;
}
