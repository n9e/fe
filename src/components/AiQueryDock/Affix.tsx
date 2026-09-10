import React from 'react';

interface AiQueryDockAffixProps {
  /** The trigger to pin inside the box at its left end; nothing is pinned when absent. */
  trigger?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Wraps a query box that has no prefix slot of its own and pins the dock's
 * trigger inside it at the left. The host gives the box room for it with the
 * `ai-query-dock-host` styles.
 */
export function AiQueryDockAffix({ trigger, children }: AiQueryDockAffixProps) {
  return (
    <div className='relative'>
      {children}
      {trigger ? <span className='ai-query-dock-affix absolute left-2 top-0 z-10 flex h-8 items-center'>{trigger}</span> : null}
    </div>
  );
}
