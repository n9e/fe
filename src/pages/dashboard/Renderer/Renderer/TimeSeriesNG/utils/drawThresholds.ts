import uPlot from 'uplot';
import _ from 'lodash';
import Color from 'color';

interface Thresholds {
  steps: {
    color: string;
    value: number;
    type: 'base' | '';
  }[];
  mode: 'absolute' | 'percentage';
}

interface ThresholdsStyle {
  mode: 'off' | 'line' | 'dashed' | 'line+area' | 'dashed+area';
}

interface Props {
  uplot: uPlot;
  thresholds: Thresholds;
  thresholdsStyle: ThresholdsStyle;
}

/**
 * 绘制阈值
 * @param props
 * @returns
 */
export default function drawThresholds(props: Props) {
  const { uplot, thresholds, thresholdsStyle } = props;
  let thresholdsSteps = _.sortBy(thresholds.steps, (item) => {
    return item.value ?? 0;
  });
  const thresholdsMode = thresholds.mode;
  if (thresholdsStyle.mode === 'off') return;
  const scaleYMax = uplot.scales.y.max;
  if (thresholdsMode === 'percentage' && scaleYMax) {
    thresholdsSteps = thresholdsSteps.map((step) => {
      if (step.type === 'base') return step;
      return {
        ...step,
        value: scaleYMax * (step.value / 100),
      };
    });
  }
  const ctx = uplot.ctx;
  ctx.save();
  const scaleXMin = uplot.scales.x.min;
  const scaleXMax = uplot.scales.x.max;
  const scaleyMin = uplot.scales.y.min;
  const scaleyMax = uplot.scales.y.max;
  if (scaleXMin !== undefined && scaleXMax !== undefined && scaleyMin !== undefined && scaleyMax !== undefined) {
    const xMin = uplot.valToPos(scaleXMin, 'x', true);
    const xMax = uplot.valToPos(scaleXMax, 'x', true);
    _.forEach(
      _.filter(thresholdsSteps, (item) => {
        return item.type !== 'base';
      }),
      (step) => {
        ctx.beginPath();
        ctx.strokeStyle = step.color;
        ctx.lineWidth = 1;
        if (thresholdsStyle.mode === 'dashed') {
          ctx.setLineDash([5, 5]);
        }
        ctx.moveTo(xMin, uplot.valToPos(step.value, 'y', true));
        ctx.lineTo(xMax, uplot.valToPos(step.value, 'y', true));
        ctx.stroke();
        ctx.closePath();
      },
    );
    if (thresholdsStyle.mode === 'line+area' || thresholdsStyle.mode === 'dashed+area') {
      _.forEach(thresholdsSteps, (step, index) => {
        ctx.beginPath();
        ctx.fillStyle = Color(step.color).alpha(0.14).rgb().string();
        const y0Value = index === 0 ? scaleyMin : step.value;
        const y1Value = index === thresholdsSteps.length - 1 ? scaleyMax : thresholdsSteps[index + 1].value;
        const y0 = uplot.valToPos(y0Value, 'y', true);
        const y1 = uplot.valToPos(y1Value, 'y', true);
        ctx.moveTo(xMin, y0);
        ctx.lineTo(xMax, y0);
        ctx.lineTo(xMax, y1);
        ctx.lineTo(xMin, y1);
        ctx.fill();
        ctx.closePath();
      });
    }
  }
  ctx.restore();
}
