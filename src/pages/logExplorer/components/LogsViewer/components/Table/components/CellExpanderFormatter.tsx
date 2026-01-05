import React from 'react';
import { Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';

import { NAME_SPACE } from '../../../../../constants';
import TextSearchIcon from '../../TextSearchIcon';

interface CellExpanderFormatterProps {
  expanded: boolean;
  onCellExpand: () => void;
}

export default function CellExpanderFormatter({ expanded, onCellExpand }: CellExpanderFormatterProps) {
  const { t } = useTranslation(NAME_SPACE);
  function handleClick(e: React.MouseEvent<HTMLSpanElement>) {
    e.preventDefault();
    onCellExpand();
  }

  return (
    <Tooltip title={t('log_viewer_drawer_trigger_tip')}>
      <div className='absolute inset-0 flex items-center justify-center cursor-pointer' onClick={handleClick}>
        {expanded ? <TextSearchIcon className='text-[14px]' /> : <TextSearchIcon className='text-[14px]' />}
      </div>
    </Tooltip>
  );
}
