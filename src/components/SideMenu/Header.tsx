import React, { useContext } from 'react';
import { Tooltip } from 'antd';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/components/menu/SideMenu/utils';
import { CommonStateContext } from '@/App';

import { DefaultLogos } from './types';

const lightCollapseButtonClass = 'text-[var(--fc-sidemenu-item-icon)] hover:bg-[var(--fc-sidemenu-item-hover-bg)] hover:text-[var(--fc-sidemenu-item-hover-text)]';

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
  const collapsedLogo = getLogoSrc(true, sideMenuBgMode, defaultLogos, siteInfo);

  if (collapsed) {
    return (
      <div className='side-menu-collapsed-logo-row relative my-1.5 flex h-10 w-full shrink-0 items-center justify-center px-2'>
        <Tooltip title={toggleTitle} placement='right'>
          <button
            type='button'
            className={cn(
              'side-menu-collapsed-logo-toggle flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0 transition-colors',
              sideMenuBgMode === 'light' ? lightCollapseButtonClass : 'text-[#fff] hover:bg-gray-200/20',
            )}
            onClick={onToggleCollapse}
          >
            <img src={collapsedLogo} width={24} height={24} className='side-menu-collapsed-logo h-6 w-6 object-contain' />
            <PanelLeftOpen className='side-menu-collapsed-logo-icon' size={16} strokeWidth={1.8} />
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className='relative my-1.5 flex h-10 w-full shrink-0 items-center gap-2 overflow-hidden pl-5 pr-2 transition-spacing'>
      <div className='min-w-0 flex-1'>
        <img src={noCollapsedLogo} width={96} height={28} className='block max-h-7 max-w-[96px] object-contain' />
      </div>
      <Tooltip title={toggleTitle} placement='right'>
        <button
          type='button'
          className={cn(
            'side-menu-header-collapse-button flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded border-0 bg-transparent p-0 transition-colors',
            sideMenuBgMode === 'light' ? lightCollapseButtonClass : 'text-[#fff]/70 hover:bg-gray-200/20 hover:text-[#fff]',
          )}
          onClick={onToggleCollapse}
        >
          <PanelLeftClose size={16} strokeWidth={1.8} />
        </button>
      </Tooltip>
    </div>
  );
}
