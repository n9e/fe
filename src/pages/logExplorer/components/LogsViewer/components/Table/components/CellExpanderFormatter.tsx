import React from 'react';
import { Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';

import { NAME_SPACE } from '../../../../../constants';
import TextSearchIcon from '../../TextSearchIcon';

interface CellExpanderFormatterProps {
  expanded: boolean;
  onCellExpand: () => void;
}

/** Keep the details click target while anchoring its tooltip to the actual icon. */
export default function CellExpanderFormatter({ expanded, onCellExpand }: CellExpanderFormatterProps) {
  const { t } = useTranslation(NAME_SPACE);
  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    onCellExpand();
  }

  return (
    <button
      type='button'
      aria-label={t('log_viewer_drawer_trigger_tip')}
      className='n9e-log-detail-button absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer'
      onClick={handleClick}
      onKeyDown={(event) => {
        // Let the native button activate without invoking grid edit/navigation.
        if (event.key === 'Enter' || event.key === ' ') event.stopPropagation();
      }}
    >
      <Tooltip title={t('log_viewer_drawer_trigger_tip')}>
        <span className='inline-flex items-center justify-center'>{expanded ? <TextSearchIcon className='text-[14px]' /> : <TextSearchIcon className='text-[14px]' />}</span>
      </Tooltip>
    </button>
  );
}
