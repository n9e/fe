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
      range: (self, min, max) => {
        return xRange;
      },
    };
  }
  if (yRange) {
    scalesOptions.y = {
      range: (self, min, max) => {
        return yRange;
      },
    };
    if (yDistr) {
      scalesOptions.y.distr = yDistr;
      scalesOptions.y.log = yLog;
    }
  }
  return scalesOptions;
}
