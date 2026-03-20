import { ReactNode } from 'react';

export interface IMenuItem {
  key: string;
  label: string;
  section?: BaseMenuItem['section'];
  icon?: React.ReactNode;
  path?: string;
  role?: string[];
  children?: IMenuItem[];
  type?: string; // 'tabs'
  pathType?: string; // 'absolute'
  target?: string; // '_blank'
  beta?: boolean;
  deprecated?: boolean;
}

export interface BaseMenuItem {
  key: string;
  label: string;
  /** 顶层分组 key，用于侧栏分区标题（连续相同 section 共用一个标题） */
  section?: 'infrastructure' | 'observability' | 'analysis' | 'platform';
  type?: string; // 'tabs'
  pathType?: string; // 'absolute'
  path?: string; // URL for absolute paths
  target?: string; // '_blank'
  role?: string[];
  deprecated?: boolean;
  children?: Array<BaseMenuItem>;
}

export interface MenuItem extends BaseMenuItem {
  icon?: ReactNode;
  children: Array<BaseMenuItem>;
}

export interface MenuMatchResult {
  currentItem: BaseMenuItem;
  parentItem?: BaseMenuItem;
  showTabs: boolean;
  icon?: ReactNode;
}

export interface DefaultLogos {
  light_menu_big_logo_url: string;
  light_menu_small_logo_url: string;
  menu_big_logo_url: string;
  menu_small_logo_url: string;
}
