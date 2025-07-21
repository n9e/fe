import React, { useState, useRef } from 'react';
import { Tooltip } from 'antd';
import { useTimeout } from 'ahooks';

interface Props {
  tooltip?: string;
  children: React.ReactNode;
}

export default function PromQLInputNGWithTooltipWrapper(props: Props) {
  const { tooltip, children } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useTimeout(() => {
    if (!tooltipVisible && tooltip) {
      setTooltipVisible(true);
    }
  }, 500);

  return (
    <Tooltip
      title={tooltip}
      placement='topRight'
      visible={tooltipVisible}
      getPopupContainer={() => {
        return containerRef.current || document.body;
      }}
    >
      <div
        ref={containerRef}
        onBlur={() => {
          setTooltipVisible(false);
        }}
      >
        {children}
      </div>
    </Tooltip>
  );
}
