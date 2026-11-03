import React, { useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Tooltip } from 'antd';

import { getSeriesTooltipContent, hasSeriesTooltipContent, SERIES_TOOLTIP_CLASS } from './utils';
import type { SeriesTooltipParams } from './utils';
import getTooltipPosition from './getTooltipPosition';
import type { TooltipPoint } from './getTooltipPosition';

import './style.less';

export { createSeriesTooltipElement, getSeriesTooltipContent } from './utils';
export type { SeriesTooltipParams } from './utils';
export type { TooltipPoint } from './getTooltipPosition';

export const SERIES_TOOLTIP_OVERLAY_CLASS = 'n9e-series-tooltip-overlay';

export function SeriesTooltipContent(props: SeriesTooltipParams) {
  const content = getSeriesTooltipContent(props);
  if (!hasSeriesTooltipContent(content)) return null;

  return (
    <div className={SERIES_TOOLTIP_CLASS}>
      {(content.title || content.value) && (
        <div className={`${SERIES_TOOLTIP_CLASS}-header`}>
          {content.title && <span className={`${SERIES_TOOLTIP_CLASS}-title`}>{content.title}</span>}
          {content.value && <span className={`${SERIES_TOOLTIP_CLASS}-value`}>{content.value}</span>}
        </div>
      )}
      {content.labels.length > 0 && (
        <ul className={`${SERIES_TOOLTIP_CLASS}-labels`}>
          {content.labels.map(({ key, value }) => (
            <li key={key}>
              {key}: {value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface SeriesTooltipOverlayProps extends SeriesTooltipParams {
  point: TooltipPoint;
}

/** 挂载到 body 的鼠标跟随浮层，统一内容布局和视口边界避让。 */
export function SeriesTooltipOverlay({ point, ...params }: SeriesTooltipOverlayProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  // 每次渲染都重新测量，兼顾鼠标移动、内容更新和异步字体加载引起的尺寸变化。
  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const updatePosition = () => {
      const position = getTooltipPosition(point, element.getBoundingClientRect(), {
        width: document.documentElement.clientWidth || window.innerWidth,
        height: document.documentElement.clientHeight || window.innerHeight,
      });
      element.style.left = `${position.left}px`;
      element.style.top = `${position.top}px`;
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  });

  if (typeof document === 'undefined' || !hasSeriesTooltipContent(getSeriesTooltipContent(params))) return null;

  return createPortal(
    <div ref={elementRef} role='tooltip' className='n9e-series-tooltip-floating'>
      <SeriesTooltipContent {...params} />
    </div>,
    document.body,
  );
}

interface SeriesTooltipProps extends SeriesTooltipParams {
  children: React.ReactElement;
  mouseEnterDelay?: number;
}

export default function SeriesTooltip(props: SeriesTooltipProps) {
  const { children, mouseEnterDelay, ...params } = props;
  if (!hasSeriesTooltipContent(getSeriesTooltipContent(params))) return children;

  return (
    <Tooltip overlayClassName={SERIES_TOOLTIP_OVERLAY_CLASS} mouseEnterDelay={mouseEnterDelay} title={<SeriesTooltipContent {...params} />}>
      {children}
    </Tooltip>
  );
}
