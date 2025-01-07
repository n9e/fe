import uPlot from 'uplot';
import _ from 'lodash';
import Color from 'color';

import { IThresholds, ThresholdsStyle } from '@/pages/dashboard/types';

interface Props {
  uplot: uPlot;
  thresholds: IThresholds;
  thresholdsStyle: ThresholdsStyle;
}

/**
 * 绘制阈值
 * @param props
 * @returns
 */
export default function drawThresholds(props: Props) {
  const { uplot, thresholds, thresholdsStyle } = props;
  const thresholdsMode = thresholds.mode;
  if (thresholdsStyle.mode === 'off') return;

  const scaleXMin = uplot.scales.x.min;
  const scaleXMax = uplot.scales.x.max;
  const scaleYMin = uplot.scales.y.min;
  const scaleYMax = uplot.scales.y.max;

  let thresholdsSteps = _.sortBy(thresholds.steps, (item) => {
    return item.value ?? 0;
  });

  if (thresholdsMode === 'percentage' && scaleYMin !== undefined && scaleYMax !== undefined) {
    thresholdsSteps = thresholdsSteps.map((step) => {
      if (step.type === 'base') return step;
      return {
        ...step,
        // Thresholds mode Percentage means thresholds relative to min & max
        value: scaleYMin + (scaleYMax - scaleYMin) * (step.value / 100),
      };
    });
  }
  const ctx = uplot.ctx;
  ctx.save();

  if (scaleXMin !== undefined && scaleXMax !== undefined && scaleYMin !== undefined && scaleYMax !== undefined) {
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
        if (thresholdsStyle.mode === 'dashed' || thresholdsStyle.mode === 'dashed+area') {
          ctx.setLineDash([10, 10]);
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
        const y0Value = index === 0 ? scaleYMin : step.value;
        const y1Value = index === thresholdsSteps.length - 1 ? scaleYMax : thresholdsSteps[index + 1].value;
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
