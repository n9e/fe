import React, { useContext } from 'react';

import { cn } from '@/components/menu/SideMenu/utils';
import { CommonStateContext } from '@/App';

import { DefaultLogos } from './types';

interface Props {
  collapsed: boolean;
  collapsedHover: boolean;
  sideMenuBgMode: string;
  defaultLogos: DefaultLogos;
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
  const { collapsed, collapsedHover, sideMenuBgMode, defaultLogos } = props;
  const { siteInfo } = useContext(CommonStateContext);

  const noCollapsedLogo = getLogoSrc(false, sideMenuBgMode, defaultLogos, siteInfo);
  const collapsedLogo = getLogoSrc(true, sideMenuBgMode, defaultLogos, siteInfo);

  return (
    <div className={cn('relative mt-6 h-10 w-full shrink-0 overflow-hidden transition-spacing', 'flex justify-center')}>
      <img
        src={noCollapsedLogo}
        width={120}
        height={38}
        className='max-w-[120px]'
        style={{
          display: !collapsed || collapsedHover ? 'block' : 'none',
        }}
      />
      <img
        src={collapsedLogo}
        width={36}
        height={38}
        className='max-w-[120px]'
        style={{
          display: !collapsed || collapsedHover ? 'none' : 'block',
        }}
      />
    </div>
  );
}
