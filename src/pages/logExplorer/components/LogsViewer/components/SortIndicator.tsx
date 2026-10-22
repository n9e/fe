import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Tooltip } from 'antd';
import type { SortIconProps } from 'react-data-grid';
import { useTranslation } from 'react-i18next';
import { NAME_SPACE } from '../../../constants';

export default function SortIndicator({ sortDirection }: SortIconProps) {
  const { t } = useTranslation(NAME_SPACE);
  if (!sortDirection) return null;
  const Icon = sortDirection === 'ASC' ? ArrowUp : ArrowDown;
  return (
    <Tooltip title={t(sortDirection === 'ASC' ? 'guidance.sort_asc' : 'guidance.sort_desc')}>
      <span className='n9e-log-sort-indicator'>
        <Icon size={12} strokeWidth={1.5} aria-hidden />
      </span>
    </Tooltip>
  );
}
