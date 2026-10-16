import React from 'react';
import { Tooltip } from 'antd';

import { getSeriesTooltipContent, hasSeriesTooltipContent, SERIES_TOOLTIP_CLASS } from './utils';
import type { SeriesTooltipParams } from './utils';

import './style.less';

export { createSeriesTooltipElement, getSeriesTooltipContent } from './utils';
export type { SeriesTooltipParams } from './utils';

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
