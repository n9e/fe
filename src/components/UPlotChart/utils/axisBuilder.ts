import uPlot, { Axis } from 'uplot';
import moment from 'moment-timezone';
import _ from 'lodash';
import getTextWidth from '@/pages/dashboard/Renderer/utils/getTextWidth';
import { FONT_FAMILY, THEME } from '@/utils/constant';

enum ScaleDistribution {
  Linear = 'linear',
  Log = 'log',
  Ordinal = 'ordinal',
  Symlog = 'symlog',
}

const UPLOT_AXIS_FONT_SIZE = 12;
const Y_TICK_SPACING_PANEL_HEIGHT = 150;
const Y_TICK_SPACING_NORMAL = 30;
const Y_TICK_SPACING_SMALL = 15;
const X_TICK_SPACING_NORMAL = 40;
const X_TICK_VALUE_GAP = 18;
const LABEL_PADDING = 8;

function formatTime(self: uPlot, splits: number[], axisIdx: number, foundSpace: number, foundIncr: number): string[] {
  const axis = self.axes[axisIdx];
  const timeZone = 'timeZone' in axis && typeof axis.timeZone === 'string' ? axis.timeZone : undefined;

  return splits.map((v) => {
    const d = new Date(v * 1000);
    let format = 'HH:mm';
    if (d.getSeconds() !== 0) {
      format = 'HH:mm:ss';
    }
    if (d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0) {
      format = 'MM-DD';
    }
    return v == null ? '' : timeZone ? moment.unix(v).tz(timeZone).format(format) : moment.unix(v).format(format);
  });
}

function calculateSpace(self: uPlot, axisIdx: number, scaleMin: number, scaleMax: number, plotDim: number, formatValue?: (value: unknown) => string): number {
  const axis = self.axes[axisIdx];
  const scale = self.scales[axis.scale!];

  // for axis left & right
  if (axis.side !== 2 || !scale) {
    return plotDim <= Y_TICK_SPACING_PANEL_HEIGHT ? Y_TICK_SPACING_SMALL : Y_TICK_SPACING_NORMAL;
  }

  const maxTicks = plotDim / X_TICK_SPACING_NORMAL;
  const increment = (scaleMax - scaleMin) / maxTicks;

  // not super great, since 0.000005 has many more chars than 1.0
  // it also doesn't work well with "short" or adaptive units, e.g. 7 K and 6.40 K
  const bigValue = Math.max(Math.abs(scaleMin), Math.abs(scaleMax));

  let sample = '';

  if (scale.time) {
    sample = formatTime(self, [bigValue], axisIdx, X_TICK_SPACING_NORMAL, increment)[0];
  } else if (formatValue != null) {
    sample = formatValue(bigValue);
  } else {
    return X_TICK_SPACING_NORMAL;
  }

  const valueWidth = getTextWidth(sample);

  return valueWidth + X_TICK_VALUE_GAP;
}

function calculateAxisSize(self: uPlot, values: string[], axisIdx: number) {
  const axis = self.axes[axisIdx];

  let axisSize = axis.ticks!.size!;

  if (axis.side === 2) {
    axisSize += axis!.gap! + UPLOT_AXIS_FONT_SIZE;
  } else if (values?.length) {
    let maxTextWidth = values.reduce((acc, value) => Math.max(acc, getTextWidth(value)), 0);
    // limit y tick label width to 40% of visualization
    const textWidthWithLimit = Math.min(self.width * 0.4, maxTextWidth);
    // Not sure why this += and not normal assignment
    axisSize += axis!.gap! + axis!.labelGap! + textWidthWithLimit;
  }

  return Math.ceil(axisSize);
}

export interface AxisProps {
  scaleKey?: string;
  theme?: 'light' | 'dark';
  label?: string;
  show?: boolean;
  size?: number | null;
  gap?: number;
  tickLabelRotation?: number;
  side?: Axis.Side;
  grid?: Axis.Grid;
  ticks?: Axis.Ticks;
  filter?: Axis.Filter;
  space?: Axis.Space;
  formatValue?: (v: number) => string;
  incrs?: Axis.Incrs;
  splits?: Axis.Splits;
  values?: Axis.Values;
  isTime?: boolean;
  color?: uPlot.Axis.Stroke;
  border?: uPlot.Axis.Border;
  distr?: ScaleDistribution;
}

export default function axisBuilder(props: AxisProps) {
  let {
    scaleKey,
    theme = 'light',
    label,
    show = true,
    side,
    grid = { show: true },
    ticks,
    space,
    filter,
    gap = 5,
    formatValue,
    splits,
    values,
    incrs,
    isTime,
    tickLabelRotation,
    size,
    color,
    border,
  } = props;

  const font = `${UPLOT_AXIS_FONT_SIZE}px ${FONT_FAMILY}`;

  const gridColor = theme === 'dark' ? 'rgba(240, 250, 255, 0.09)' : 'rgba(0, 10, 23, 0.09)';

  let config: Axis = {
    show,
    stroke: color ?? THEME?.[theme]?.text?.primary,
    font,
    size:
      size ??
      ((self, values, axisIdx) => {
        return calculateAxisSize(self, values, axisIdx);
      }),
    rotate: tickLabelRotation,
    gap,
    labelGap: 0,
    grid: {
      show: grid.show,
      stroke: gridColor,
      width: 1 / devicePixelRatio,
    },
    ticks: Object.assign(
      {
        show: true,
        stroke: border?.show ? color ?? THEME?.[theme]?.text?.primary : gridColor,
        width: 1 / devicePixelRatio,
        size: 4,
      },
      ticks,
    ),
    splits,
    values,
    space:
      space ??
      ((self, axisIdx, scaleMin, scaleMax, plotDim) => {
        return calculateSpace(self, axisIdx, scaleMin, scaleMax, plotDim, formatValue);
      }),
    filter,
    incrs,
  };

  if (scaleKey) {
    config.scale = scaleKey;
  }
  if (_.isNumber(side)) {
    config.side = side;
  }

  if (border?.show) {
    config.border = {
      stroke: color ?? THEME?.[theme]?.text?.primary,
      width: 1 / devicePixelRatio,
      ...border,
    };
  }

  if (label != null && label.length > 0) {
    config.label = label;
    config.labelSize = UPLOT_AXIS_FONT_SIZE + LABEL_PADDING;
    config.labelFont = font;
    config.labelGap = LABEL_PADDING;
  }

  if (values) {
    config.values = values;
  } else if (isTime) {
    config.values = formatTime;
  } else if (formatValue) {
    config.values = (u: uPlot, splits, axisIdx, tickSpace, tickIncr) => {
      return splits.map((v) => {
        if (v == null) {
          return null;
        } else {
          return formatValue!(v);
        }
      });
    };
  }

  return config;
}
