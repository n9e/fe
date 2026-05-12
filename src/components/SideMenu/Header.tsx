import React, { useContext } from 'react';
import { Tooltip } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

import { cn } from '@/components/menu/SideMenu/utils';
import { CommonStateContext } from '@/App';

import { DefaultLogos } from './types';

interface Props {
  collapsed: boolean;
  sideMenuBgMode: string;
  defaultLogos: DefaultLogos;
  onToggleCollapse: () => void;
  toggleTitle: string;
}

const getLogoSrc = (collapsed: boolean, sideMenuBgMode: string, defaultLogos: DefaultLogos, siteInfo?: any) => {
  if (!collapsed) {
    if (sideMenuBgMode === 'light') {
      return siteInfo?.light_menu_big_logo_url || defaultLogos.light_menu_big_logo_url || '/image/logo-light-l.png';
    }
    return siteInfo?.menu_big_logo_url || defaultLogos.menu_big_logo_url || '/image/logo-l.png';
  }
  if (sideMenuBgMode === 'light') {
    return siteInfo?.light_menu_small_logo_url || defaultLogos.light_menu_small_logo_url || '/image/logo-light.png';
  }
  return siteInfo?.menu_small_logo_url || defaultLogos.menu_small_logo_url || '/image/logo.png';
};

export default function SideMenuHeader(props: Props) {
  const { collapsed, sideMenuBgMode, defaultLogos, onToggleCollapse, toggleTitle } = props;
  const { siteInfo } = useContext(CommonStateContext);

  const noCollapsedLogo = getLogoSrc(false, sideMenuBgMode, defaultLogos, siteInfo);

  return (
    <div
      className={cn(
        'relative mt-4 mb-3 flex h-10 w-full shrink-0 items-center overflow-hidden transition-spacing',
        collapsed ? 'justify-center px-2' : 'justify-between pl-5 pr-2',
      )}
    >
      <div style={{ display: collapsed ? 'none' : 'block' }}>
        <img
          src={noCollapsedLogo}
          width={120}
          height={38}
          className='max-w-[120px]'
          style={{
            display: collapsed ? 'none' : 'block',
          }}
        />
      </div>
      <Tooltip title={toggleTitle} placement='right'>
        <button
          type='button'
          className={cn(
            'flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0 transition-colors',
            sideMenuBgMode === 'light' ? 'text-hint hover:bg-fc-200 hover:text-title' : 'text-[#fff] hover:bg-gray-200/20',
          )}
          onClick={onToggleCollapse}
        >
          {collapsed ? <MenuUnfoldOutlined className='h-4 w-4 children-icon:h-4 children-icon:w-4' /> : <MenuFoldOutlined className='h-4 w-4 children-icon:h-4 children-icon:w-4' />}
        </button>
      </Tooltip>
    </div>
  );
}
