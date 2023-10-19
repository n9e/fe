export interface IMenuItem {
  key: string;
  label: string;
  icon?: any;
  activeIcon?: any;
  // permissions?: IAccountPermission[];
  children?: IMenuItem[] | undefined;
}
