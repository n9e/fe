import React from 'react';
import { Button, Tooltip } from 'antd';

interface Props {
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  expanded?: boolean;
  controls?: string;
  disabled?: boolean;
}

/** Render a compact labeled histogram action with optional pressed or expanded state. */
export default function HistogramActionButton({ title, icon, onClick, active, expanded, controls, disabled }: Props) {
  const button = (
    <Button
      size='small'
      disabled={disabled}
      className={`n9e-log-histogram-action${active ? ' n9e-log-histogram-action-active' : ''}${disabled ? ' pointer-events-none' : ''}`}
      style={disabled ? { color: 'var(--fc-text-4)' } : undefined}
      aria-label={title}
      aria-pressed={active}
      aria-expanded={expanded}
      aria-controls={controls}
      icon={icon}
      onClick={onClick}
    />
  );

  return (
    <Tooltip placement='topRight' title={title}>
      {disabled ? <span className='inline-flex cursor-not-allowed'>{button}</span> : button}
    </Tooltip>
  );
}
