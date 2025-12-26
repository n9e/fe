import React from 'react';
import { DownOutlined, RightOutlined } from '@ant-design/icons';

interface CellExpanderFormatterProps {
  isCellSelected: boolean;
  expanded: boolean;
  onCellExpand: () => void;
}

export default function CellExpanderFormatter({ isCellSelected, expanded, onCellExpand }: CellExpanderFormatterProps) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLSpanElement>) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onCellExpand();
    }
  }

  function handleClick(e: React.MouseEvent<HTMLSpanElement>) {
    e.preventDefault();
    onCellExpand();
  }

  return (
    <span onKeyDown={handleKeyDown}>
      <span className='cursor-pointer' onClick={handleClick}>
        {expanded ? <DownOutlined /> : <RightOutlined />}
      </span>
    </span>
  );
}
