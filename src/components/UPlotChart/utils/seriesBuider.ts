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
  const { baseSeries, colors, overrides } = props;
  const defaultPathsType = props.pathsType;
  const defaultWidth = props.width ?? 1;
  const defaultPoints = props.points;
  const defaultFillOpacity = props.fillOpacity ?? 0.1;
  const defaultGradientMode = props.gradientMode ?? 'none';
  const defaultSpanGaps = props.spanGaps;

  const rightYAxisDisplay = _.get(overrides, [0, 'properties', 'rightYAxisDisplay']);
  const matchRefId = _.get(overrides, [0, 'matcher', 'value']);
  const refIds = _.union(_.map(baseSeries, (item) => _.get(item, 'n9e_internal.refId')));
  const series: Series[] = _.concat(
    [{}] as Series[],
    _.map(baseSeries, (item, idx) => {
      const refId = _.get(item, 'n9e_internal.refId');

      // Initialize current series options with defaults
      let currentWidth = defaultWidth;
      let currentPoints = defaultPoints;
      let currentFillOpacity = defaultFillOpacity;
      let currentGradientMode = defaultGradientMode;
      let currentSpanGaps = defaultSpanGaps;
      let currentPathsType = defaultPathsType;

      const curOverride = _.find(overrides, (override) => {
        // TODO 删除的时候可能会出现 matcher 不存在的情况，一个 bug 需要修复，像是删除的时候出现一个临时的状态（没有被彻底删除前）
        if (override.matcher?.id === 'byFrameRefID') {
          return override.matcher.value === refId;
        }
        return false;
      });
      let scaleKey = 'y';
      // refIds.length > 1 TODO: 暂时不支持单独设置右侧Y轴
      if (refIds.length > 1 && rightYAxisDisplay === 'normal' && matchRefId === refId) {
        scaleKey = 'y2';
      }
      if (curOverride) {
        const overrideOptions = normalizeOverrideSeriesOptions(curOverride);
        if (_.isNumber(overrideOptions.width)) {
          currentWidth = overrideOptions.width;
        }
        if (overrideOptions.pathsType) {
          currentPathsType = overrideOptions.pathsType;
        }
        if (overrideOptions.points) {
          currentPoints = overrideOptions.points;
        }
        if (overrideOptions.spanGaps !== undefined) {
          currentSpanGaps = overrideOptions.spanGaps;
        }
        if (_.isNumber(overrideOptions.fillOpacity)) {
          currentFillOpacity = overrideOptions.fillOpacity;
        }
        if (overrideOptions.gradientMode) {
          currentGradientMode = overrideOptions.gradientMode;
        }
      }

      let paths;
      if (currentPathsType === 'spline') {
        paths = uPlot.paths.spline && uPlot.paths.spline();
      } else if (currentPathsType === 'bars') {
        paths = uPlot.paths.bars && uPlot.paths.bars();
      }

      return {
        ...item,
        scale: scaleKey,
        stroke: colors[idx % colors.length],
        paths,
        width: currentWidth,
        points: currentPoints,
        spanGaps: currentSpanGaps,
        fill:
          currentFillOpacity !== 0
            ? (self, seriesIdx) => {
                const seriesStroke = self.series[seriesIdx].stroke;
                if (typeof seriesStroke === 'function') {
                  const color = seriesStroke(self, seriesIdx);
                  if (currentGradientMode === 'opacity') {
                    const gradient = self.ctx.createLinearGradient(0, 0, 0, self.bbox.height);
                    gradient.addColorStop(0, Color(color).alpha(0.6).rgb().string());
                    gradient.addColorStop(1, Color(color).alpha(0.01).rgb().string());
                    return gradient;
                  }
                  return Color(color).alpha(currentFillOpacity).rgb().string();
                }
                return '';
              }
            : undefined,
      };
    }),
  );

  return series;
}
