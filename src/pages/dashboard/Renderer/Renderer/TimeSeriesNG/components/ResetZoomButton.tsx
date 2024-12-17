import React from 'react';
import { Button } from 'antd';
import uplot from 'uplot';

interface Props {
  showResetZoomBtn: boolean;
  getUplot: () => uplot;
  xScaleInitMinMax?: [number, number];
  yScaleInitMinMax?: [number, number];
}

export default function ResetZoomButton(props: Props) {
  const { showResetZoomBtn, getUplot, xScaleInitMinMax, yScaleInitMinMax } = props;

  return (
    <Button
      className='renderer-timeseries-graph-zoom-resetBtn'
      style={{
        display: showResetZoomBtn ? 'block' : 'none',
      }}
      onClick={() => {
        const uplot = getUplot();
        if (uplot && xScaleInitMinMax && yScaleInitMinMax) {
          uplot.setScale('x', { min: xScaleInitMinMax[0], max: xScaleInitMinMax[1] });
          uplot.setScale('y', { min: yScaleInitMinMax[0], max: yScaleInitMinMax[1] });
        }
      }}
    >
      Reset zoom
    </Button>
  );
}
