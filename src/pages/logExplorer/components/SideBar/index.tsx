import React from 'react';
import { useTranslation } from 'react-i18next';
import RetainedSidebar from '@/components/RetainedSidebar';

interface Props {
  ns: string;
  children: React.ReactNode;
}

export default function SideBar({ ns, children }: Props) {
  const { t } = useTranslation('retainedSidebar');
  return (
    <RetainedSidebar
      className='fc-retained-sidebar--logs'
      title={t('filters')}
      autoSummary
      collapseLocalStorageKey={`ng-${ns}-explorer-sidebar-collapse`}
      widthLocalStorageKey={`ng-${ns}-explorer-sidebar-width`}
    >
      {children}
    </RetainedSidebar>
  );
}
