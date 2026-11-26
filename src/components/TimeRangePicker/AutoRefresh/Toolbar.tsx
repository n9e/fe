import React from 'react';
import { useTranslation } from 'react-i18next';
import './style.less';

/** Keep refresh expansion outside all commands in a right-aligned toolbar. */
export default function RefreshToolbar({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const { t } = useTranslation('timePickerInteraction');
  return (
    <div className='auto-refresh-toolbar' style={style}>
      <span className='auto-refresh-toolbar__reserve' aria-hidden='true'>
        <span>
          <span>{t('refreshing')}</span>
        </span>
      </span>
      {children}
    </div>
  );
}
