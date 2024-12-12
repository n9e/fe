import React from 'react';
import { Button } from 'antd';

interface Props {
  showResetZoomBtn: boolean;
  uPlotChartRef: any;
  xScaleRange: any;
}

export default function ResetZoomButton(props: Props) {
  const { showResetZoomBtn, uPlotChartRef, xScaleRange } = props;
  return (
    <Button
      className='renderer-timeseries-graph-zoom-resetBtn'
      style={{
        display: showResetZoomBtn ? 'block' : 'none',
      }}
      onClick={() => {
        const uPlot = uPlotChartRef.current && uPlotChartRef.current.getChartInstance();
        if (uPlot && xScaleRange.current) {
          uPlot.setScale('x', { min: xScaleRange.current[0], max: xScaleRange.current[1] });
        }
      }}
    >
      Reset zoom
    </Button>
  );
}
