import React from 'react';
import classNames from 'classnames';

interface LandingMatrixArrowProps {
  label: string;
  variant: 'ingest' | 'alert';
  className?: string;
}

/** 矩阵层之间的提示标签 + 上行箭头。纯 CSS 实现，不依赖 figma SVG 资产 */
export function LandingMatrixArrow({ label, variant, className }: LandingMatrixArrowProps) {
  return (
    <div className={classNames('landing-matrix-arrow', `landing-matrix-arrow-${variant}`, className)}>
      <span className='landing-matrix-arrow-line' />
      <span className='landing-matrix-arrow-pill'>
        <svg className='landing-matrix-arrow-icon' viewBox='0 0 12 12' aria-hidden>
          <path d='M6 1 L10 6 L7.5 6 L7.5 11 L4.5 11 L4.5 6 L2 6 Z' fill='currentColor' />
        </svg>
        <span>{label}</span>
      </span>
    </div>
  );
}

interface LandingAlertHubProps {
  label: string;
}

/** 告警事件汇聚到右侧"通知媒介"的横向箭头 */
export function LandingAlertHub({ label }: LandingAlertHubProps) {
  return (
    <div className='landing-alert-hub'>
      <span className='landing-alert-hub-line' />
      <span className='landing-alert-hub-pill'>
        <span>{label}</span>
        <svg className='landing-alert-hub-icon' viewBox='0 0 12 12' aria-hidden>
          <path d='M1 6 L7 6 L7 3 L11 6 L7 9 L7 6 Z' fill='currentColor' />
        </svg>
      </span>
    </div>
  );
}
