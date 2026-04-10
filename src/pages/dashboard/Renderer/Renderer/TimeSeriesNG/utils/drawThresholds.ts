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
        return item.type !== 'base' && item.value >= scaleYMin && item.value <= scaleYMax;
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
        // Check if the current step is within the Y axis range
        const currentStepInRange = step.value >= scaleYMin && step.value <= scaleYMax;
        const nextStepInRange = index < thresholdsSteps.length - 1 && thresholdsSteps[index + 1].value >= scaleYMin && thresholdsSteps[index + 1].value <= scaleYMax;

        // Skip if both current and next steps are outside the range
        if (!currentStepInRange && !nextStepInRange) {
          return;
        }

        ctx.beginPath();
        ctx.fillStyle = Color(step.color).alpha(0.14).rgb().string();

        // Clamp y0Value and y1Value to the Y axis range
        let y0Value = index === 0 ? scaleYMin : step.value;
        let y1Value = index === thresholdsSteps.length - 1 ? scaleYMax : thresholdsSteps[index + 1].value;

        y0Value = Math.max(scaleYMin, Math.min(scaleYMax, y0Value));
        y1Value = Math.max(scaleYMin, Math.min(scaleYMax, y1Value));

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
