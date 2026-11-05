import React from 'react';
import RetainedSidebar from '@/components/RetainedSidebar';

interface Props {
  children: React.ReactNode;
  collapseLocalStorageKey: string;
  widthLocalStorageKey: string;
  defaultWidth: number;
  minWidth?: number;
  tooltip?: string;
  summary?: string;
}

export default function Collapse({ tooltip = '', ...props }: Props) {
  return <RetainedSidebar {...props} title={tooltip} autoSummary />;
}
