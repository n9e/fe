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
  overrides?: any;
  spanGaps?: boolean;
}

export default function seriesBuider(props: Props) {
  const { baseSeries, colors, pathsType, width = 1, points, fillOpacity = 0.1, gradientMode = 'none', overrides, spanGaps } = props;
  let paths;
  if (pathsType === 'spline') {
    paths = uPlot.paths.spline && uPlot.paths.spline();
  } else if (pathsType === 'bars') {
    paths = uPlot.paths.bars && uPlot.paths.bars();
  }
  const rightYAxisDisplay = _.get(overrides, [0, 'properties', 'rightYAxisDisplay']);
  const matchRefId = _.get(overrides, [0, 'matcher', 'value']);
  const refIds = _.union(_.map(baseSeries, (item) => _.get(item, 'n9e_internal.refId')));
  const series: Series[] = _.concat(
    [{}] as Series[],
    _.map(baseSeries, (item, idx) => {
      const refId = _.get(item, 'n9e_internal.refId');
      let scaleKey = 'y';
      // refIds.length > 1 TODO: 暂时不支持单独设置右侧Y轴
      if (refIds.length > 1 && rightYAxisDisplay === 'noraml' && matchRefId === refId) {
        scaleKey = 'y2';
      }
      return {
        ...item,
        scale: scaleKey,
        stroke: colors[idx % colors.length],
        paths,
        width,
        points,
        spanGaps,
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
