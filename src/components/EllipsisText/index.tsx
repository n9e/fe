import React, { useRef, useState } from 'react';
import { Tooltip } from 'antd';
import type { TooltipProps } from 'antd';
import classNames from 'classnames';

export interface EllipsisTextProps {
  /** content to render, truncated to a single line */
  text: React.ReactNode;
  /** tooltip content when truncated; defaults to `text` */
  title?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** extra props forwarded to the underlying Tooltip */
  tooltipProps?: Partial<TooltipProps>;
}

const ellipsisStyle: React.CSSProperties = {
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
};

/**
 * Single-line text that truncates with an ellipsis when it overflows its
 * container, revealing the full content in a tooltip on hover — but only when
 * it is actually truncated. The tooltip is controlled and overflow is measured
 * lazily on hover, so it stays cheap when rendered across many table rows.
 *
 * Relies on the container having a bounded width (e.g. a fixed-layout table
 * cell, which antd uses whenever a column is fixed/has ellipsis/scroll).
 */
export default function EllipsisText({ text, title, className, style, tooltipProps }: EllipsisTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  const onVisibleChange = (open: boolean) => {
    if (!open) {
      setVisible(false);
      return;
    }
    const el = ref.current;
    setVisible(!!el && el.scrollWidth > el.clientWidth);
  };

  return (
    <Tooltip
      title={title ?? text}
      visible={visible}
      onVisibleChange={onVisibleChange}
      // light surface tooltip via design tokens; auto-flips to a dark surface in dark mode
      color='var(--fc-fill-2)'
      overlayInnerStyle={{ color: 'var(--fc-text-1)', border: '1px solid var(--fc-border-color)' }}
      {...tooltipProps}
    >
      <div ref={ref} className={classNames('fc-ellipsis-text', className)} style={{ ...ellipsisStyle, ...style }}>
        {text}
      </div>
    </Tooltip>
  );
}
