import uPlot, { Series } from 'uplot';
import _ from 'lodash';
import Color from 'color';

interface Props {
  baseSeries: Series[];
  colors: string[];
  pathsType?: 'linear' | 'spline' | 'bars';
  width?: number; // line width
  points?: Series.Points;
  fillOpacity?: number;
  gradientMode?: 'none' | 'opacity';
}

export default function seriesBuider(props: Props) {
  const { baseSeries, colors, pathsType, width = 1, points, fillOpacity = 0.1, gradientMode = 'none' } = props;
  let paths;
  if (pathsType === 'spline') {
    paths = uPlot.paths.spline && uPlot.paths.spline();
  } else if (pathsType === 'bars') {
    paths = uPlot.paths.bars && uPlot.paths.bars();
  }
  const series: Series[] = _.concat(
    [{}] as Series[],
    _.map(baseSeries, (item, idx) => {
      return {
        ...item,
        stroke: colors[idx % colors.length],
        paths,
        width,
        points,
        fill:
          fillOpacity !== 0
            ? (self, seriesIdx) => {
                const seriesStroke = self.series[seriesIdx].stroke;
                if (typeof seriesStroke === 'function') {
                  const color = seriesStroke(self, seriesIdx);
                  if (gradientMode === 'opacity') {
                    const gradient = self.ctx.createLinearGradient(0, 0, 0, self.bbox.height);
                    gradient.addColorStop(0, Color(color).alpha(0.6).rgb().string());
                    gradient.addColorStop(1, Color(color).alpha(0.01).rgb().string());
                    return gradient;
                  }
                  return Color(color).alpha(fillOpacity).rgb().string();
                }
                return '';
              }
            : undefined,
      };
    }),
  );
  return series;
}
