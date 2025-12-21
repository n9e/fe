import React from 'react';
import { useFocusRef } from 'react-data-grid';
import { DownOutlined, RightOutlined } from '@ant-design/icons';

interface CellExpanderFormatterProps {
  isCellSelected: boolean;
  expanded: boolean;
  onCellExpand: () => void;
}

export default function CellExpanderFormatter({ isCellSelected, expanded, onCellExpand }: CellExpanderFormatterProps) {
  const { ref, tabIndex } = useFocusRef<HTMLSpanElement>(isCellSelected);

  function handleKeyDown(e: React.KeyboardEvent<HTMLSpanElement>) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onCellExpand();
    }
  }

  return (
    <span onClick={onCellExpand} onKeyDown={handleKeyDown}>
      <span className='cursor-pointer' ref={ref} tabIndex={tabIndex}>
        {expanded ? <DownOutlined /> : <RightOutlined />}
      </span>
    </span>
  );
}
