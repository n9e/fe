import { BaseMenuItem } from '@/components/SideMenu/types';
import { ReactNode } from 'react';
export interface MenuMatchResult {
  currentItem: BaseMenuItem;
  parentItem?: BaseMenuItem;
  showTabs: boolean;
  icon?: ReactNode;
}
