import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { MenuItem } from '@/components/SideMenu/types';

import { MenuMatchResult } from './types';
import './TabMenu.less';

interface TabMenuProps {
  currentMenu: MenuMatchResult | null;
  onTabChange?: (key: string) => void;
}

export const findMenuByPath = (path: string, menuList: MenuItem[]): MenuMatchResult | null => {
  for (const parent of menuList) {
    if (!parent.children) continue;

    for (const child of parent.children) {
      if (child.children) {
        for (const grandChild of child.children) {
          if (grandChild.key === path) {
            return {
              currentItem: grandChild,
              parentItem: child,
              showTabs: child.type === 'tabs',
              icon: parent?.icon,
            };
          }
        }
      }
    }
  }
  return null;
};

const getStorageKey = (parentKey: string) => `tab_selection_${parentKey}`;

export const TabMenu: React.FC<TabMenuProps> = ({ currentMenu, onTabChange }) => {
  const history = useHistory();
  const { t } = useTranslation('sideMenu');
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    if (currentMenu?.currentItem && currentMenu?.parentItem) {
      const storageKey = getStorageKey(currentMenu.parentItem.key);
      const savedTab = localStorage.getItem(storageKey);
      const isValidTab = currentMenu.parentItem.children?.some((child) => child.key === savedTab);

      if (savedTab && isValidTab) {
        setActiveTab(savedTab);
        if (savedTab !== currentMenu.currentItem.key) {
          history.push(savedTab);
        }
      } else {
        setActiveTab(currentMenu.currentItem.key);
      }
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
