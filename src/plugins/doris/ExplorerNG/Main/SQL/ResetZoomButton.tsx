import React from 'react';
import { Button } from 'antd';
import uplot from 'uplot';
import classNames from 'classnames';

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
      className={classNames('absolute z-10 top-2 right-2 bg-fc-100 hover:bg-fc-200', {
        hidden: !showResetZoomBtn,
        block: showResetZoomBtn,
      })}
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
