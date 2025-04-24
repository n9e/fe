export interface BaseMenuItem {
  key: string;
  label: string;
  type?: string;
  path?: string;
  children?: Array<BaseMenuItem>;
}

export interface MenuItem extends BaseMenuItem {
  children: Array<BaseMenuItem>;
}

export interface MenuMatchResult {
  currentItem: BaseMenuItem;
  parentItem?: BaseMenuItem;
  showTabs: boolean;
}
