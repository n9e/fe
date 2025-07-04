import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { MenuItem } from '@/components/SideMenu/types';
import { getMenuList } from '@/components/SideMenu/menu';
import { IS_PLUS } from '@/utils/constant';

// @ts-ignore
import getPlusMenuList from 'plus:/parcels/SideMenu/menu';

import { MenuMatchResult } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getCurrentMenuList = (): MenuItem[] => {
  return IS_PLUS ? getPlusMenuList() : getMenuList();
};

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

export const getStorageKey = (parentKey: string) => `tab_selection_${parentKey}`;

/*
 * 根据点击菜单的路径获取当前实际跳转的菜单路径
 * 一些菜单对应的页面会页面级别的 Tabs，这里之前选择的 Tab 会被保存到 localStorage 中
 * 当用户再次点击菜单时，会从 localStorage 中获取之前保存的 Tab 路径
 * 如果存在，则返回该路径，否则返回当前菜单的路径
 * @param pathname 当前菜单路径
 * @returns 返回当前菜单项的保存路径
 */
export const getSavedPath = (pathname: string) => {
  const menuList = getCurrentMenuList();
  const currentMenu = findMenuByPath(pathname, menuList);
  if (currentMenu?.currentItem && currentMenu?.parentItem) {
    const storageKey = getStorageKey(currentMenu.parentItem.key);
    return localStorage.getItem(storageKey);
  }
};
