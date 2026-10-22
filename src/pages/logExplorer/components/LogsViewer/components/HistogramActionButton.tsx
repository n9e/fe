import React from 'react';
import { Button, Tooltip } from 'antd';

interface Props {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  expanded?: boolean;
  controls?: string;
}

/** Render a compact labeled histogram action with optional pressed or expanded state. */
export default function HistogramActionButton({ title, icon, onClick, active, expanded, controls }: Props) {
  return (
    <Tooltip placement='topRight' title={title}>
      <Button
        size='small'
        className={`n9e-log-histogram-action${active ? ' n9e-log-histogram-action-active' : ''}`}
        aria-label={title}
        aria-pressed={active}
        aria-expanded={expanded}
        aria-controls={controls}
        icon={icon}
        onClick={onClick}
      />
    </Tooltip>
  );
}
