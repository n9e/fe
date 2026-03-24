import React from 'react';
import classNames from 'classnames';

import './style.less';

export type ProgressStatus = 'default' | 'inactive';

export interface ProgressProps {
  percent?: number;
  strokeColor?: string;
  trailColor?: string;
  status?: ProgressStatus;
  className?: string;
}

function clampPercent(percent: number) {
  if (Number.isNaN(percent)) {
    return 0;
  }
  if (percent < 0) {
    return 0;
  }
  if (percent > 100) {
    return 100;
  }
  return percent;
}

export default function N9EProgress(props: ProgressProps) {
  const { percent = 0, strokeColor = 'var(--fc-fill-success)', trailColor = 'var(--fc-fill-1)', status = 'default', className } = props;

  const safePercent = clampPercent(percent);
  const isInactive = status === 'inactive';

  return (
    <div
      className={classNames('n9e-progress', className, {
        'n9e-progress-inactive': isInactive,
      })}
      style={{
        ['--n9e-progress-stroke-color' as string]: strokeColor,
        ['--n9e-progress-trail-color' as string]: trailColor,
        ['--n9e-progress-percent' as string]: `${safePercent}%`,
      }}
    >
      <div className='n9e-progress-trail'>{!isInactive && <div className='n9e-progress-stroke' />}</div>
    </div>
  );
}
