import React from 'react';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tabs } from 'antd';

import { MenuItem, MenuMatchResult } from './types';

interface TabMenuProps {
  currentMenu: MenuMatchResult | null;
  onTabChange?: (key: string) => void;
}

export const findMenuByPath = (path: string, menuList: MenuItem[]): MenuMatchResult | null => {
  for (const parent of menuList) {
    if (!parent.children) continue;

    for (const child of parent.children) {
      // 检查当前项
      if (child.path === path) {
        return {
          currentItem: child,
          parentItem: parent,
          showTabs: child.type === 'tabs',
        };
      }

      // 检查子项
      if (child.children) {
        for (const grandChild of child.children) {
          if (grandChild.path === path) {
            return {
              currentItem: grandChild,
              parentItem: child,
              showTabs: child.type === 'tabs',
            };
          }
        }
      }
    }
  }
  return null;
};

export const TabMenu: React.FC<TabMenuProps> = ({ currentMenu, onTabChange }) => {
  const history = useHistory();
  const { t } = useTranslation('pageLayout');
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    if (currentMenu?.currentItem) {
      setActiveTab(currentMenu.currentItem.key);
    }
  }, [currentMenu]);

  if (!currentMenu?.showTabs || !currentMenu?.parentItem?.children) {
    return null;
  }

  return (
    <Tabs
      activeKey={activeTab}
      onChange={(key) => {
        setActiveTab(key);
        const targetTab = currentMenu.parentItem?.children?.find((c) => c.key === key);
        if (targetTab?.path) {
          history.push(targetTab.path);
        }
        onTabChange?.(key);
      }}
      className='px-4 header-tabs'
    >
      {currentMenu.parentItem.children.map((item) => (
        <Tabs.TabPane key={item.key} tab={t(item.label)}></Tabs.TabPane>
      ))}
    </Tabs>
  );
};
