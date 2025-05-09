import { ReactNode } from 'react';

export interface IMenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  role?: string[];
  children?: IMenuItem[];
  type?: string;
  beta?: boolean;
  deprecated?: boolean;
}

export interface BaseMenuItem {
  key: string;
  label: string;
  type?: string;
  role?: string[];
  deprecated?: boolean;
  children?: Array<BaseMenuItem>;
}

export interface MenuItem extends BaseMenuItem {
  icon?: ReactNode;
  children: Array<BaseMenuItem>;
}
