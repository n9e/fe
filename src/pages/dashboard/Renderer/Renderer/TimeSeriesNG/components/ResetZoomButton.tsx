import React from 'react';
import { Button } from 'antd';

interface Props {
  showResetZoomBtn: boolean;
  uPlotChartRef: any;
  xScaleInitMinMax?: [number, number];
  yScaleInitMinMax?: [number, number];
}

export default function ResetZoomButton(props: Props) {
  const { showResetZoomBtn, uPlotChartRef, xScaleInitMinMax, yScaleInitMinMax } = props;

  return (
    <Button
      className='renderer-timeseries-graph-zoom-resetBtn'
      style={{
        display: showResetZoomBtn ? 'block' : 'none',
      }}
      onClick={() => {
        const uPlot = uPlotChartRef.current && uPlotChartRef.current.getChartInstance();
        if (uPlot && xScaleInitMinMax && yScaleInitMinMax) {
          uPlot.setScale('x', { min: xScaleInitMinMax[0], max: xScaleInitMinMax[1] });
          uPlot.setScale('y', { min: yScaleInitMinMax[0], max: yScaleInitMinMax[1] });
        }
      }}
    >
      Reset zoom
    </Button>
  );
}
