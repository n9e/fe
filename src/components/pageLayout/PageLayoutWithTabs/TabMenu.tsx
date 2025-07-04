import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { getStorageKey } from '@/components/SideMenu/utils';
import { MenuMatchResult } from '@/components/SideMenu/types';

import './TabMenu.less';

interface TabMenuProps {
  currentMenu: MenuMatchResult | null;
  onTabChange?: (key: string) => void;
}

export const TabMenu: React.FC<TabMenuProps> = ({ currentMenu, onTabChange }) => {
  const history = useHistory();
  const { t } = useTranslation('sideMenu');
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    if (currentMenu?.currentItem && currentMenu?.parentItem) {
      setActiveTab(currentMenu.currentItem.key);
    }
  }, [currentMenu]);

  if (!currentMenu?.showTabs || !currentMenu?.parentItem?.children) {
    return null;
  }

  return (
    <div className='flex items-center gap-0 h-[50px] -mt-[10px] -mb-[10px] border-b border-fc-200'>
      {currentMenu.parentItem.children.map((item) => (
        <div
          key={item.key}
          className={`relative px-5 h-full flex items-center cursor-pointer text-sm transition-colors duration-300 ${
            activeTab === item.key ? 'text-primary  custom-tab-active bg-gray-200/20' : 'text-fc-300 hover:text-fc-100'
          }`}
          onClick={() => {
            setActiveTab(item.key);
            const targetTab = currentMenu.parentItem?.children?.find((c) => c.key === item.key);
            if (targetTab?.key && currentMenu.parentItem) {
              const storageKey = getStorageKey(currentMenu.parentItem.key);
              localStorage.setItem(storageKey, item.key);
              history.push(targetTab.key);
            }
            onTabChange?.(item.key);
          }}
        >
          {t(item.label)}
        </div>
      ))}
    </div>
  );
};
