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

// TODO: 临时集中处理将 override 的属性转换为 uPlot 的 series 属性
function normalizeOverrideSeriesOptions(override: any) {
  const drawStyle = _.get(override, ['properties', 'drawStyle']);
  const lineInterpolation = _.get(override, ['properties', 'lineInterpolation']);
  const lineWidth = _.get(override, ['properties', 'lineWidth']);
  const fillOpacity = _.get(override, ['properties', 'fillOpacity']);
  const gradientMode = _.get(override, ['properties', 'gradientMode']);
  const showPoints = _.get(override, ['properties', 'showPoints']);
  const pointSize = _.get(override, ['properties', 'pointSize']);
  const spanNulls = _.get(override, ['properties', 'spanNulls']);

  let pathsType, points;

  // TODO: none 是一个临时值，为了兼容 override 中的 drawStyle 不设置的状态
  if (drawStyle && drawStyle !== 'none') {
    pathsType = drawStyle === 'bars' ? 'bars' : lineInterpolation === 'smooth' ? 'spline' : 'linear';
  }
  if (showPoints) {
    points = { show: showPoints === 'always', size: showPoints === 'always' ? pointSize : 6 };
  }

  return {
    width: lineWidth,
    pathsType,
    fillOpacity,
    gradientMode,
    points,
    spanGaps: spanNulls,
  };
}

export default function seriesBuider(props: Props) {
  let { baseSeries, colors, pathsType, width = 1, points, fillOpacity = 0.1, gradientMode = 'none', overrides, spanGaps } = props;
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
      const curOverride = _.find(overrides, (override) => {
        if (override.matcher.id === 'byFrameRefID') {
          return override.matcher.value === refId;
        }
        return false;
      });
      let scaleKey = 'y';
      // refIds.length > 1 TODO: 暂时不支持单独设置右侧Y轴
      if (refIds.length > 1 && rightYAxisDisplay === 'noraml' && matchRefId === refId) {
        scaleKey = 'y2';
      }
      if (curOverride) {
        const overrideOptions = normalizeOverrideSeriesOptions(curOverride);
        if (_.isNumber(overrideOptions.width)) {
          width = overrideOptions.width;
        }
        if (overrideOptions.pathsType) {
          paths = undefined; // reset paths
          if (overrideOptions.pathsType === 'spline') {
            paths = uPlot.paths.spline && uPlot.paths.spline();
          } else if (overrideOptions.pathsType === 'bars') {
            paths = uPlot.paths.bars && uPlot.paths.bars();
          }
        }
        if (overrideOptions.points) {
          points = overrideOptions.points;
        }
        if (overrideOptions.spanGaps !== undefined) {
          spanGaps = overrideOptions.spanGaps;
        }
        if (_.isNumber(overrideOptions.fillOpacity)) {
          fillOpacity = overrideOptions.fillOpacity;
        }
        if (overrideOptions.gradientMode) {
          gradientMode = overrideOptions.gradientMode;
        }
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
