import React, { useContext } from 'react';
import { cn } from '@/components/menu/SideMenu/utils';
import { CommonStateContext } from '@/App';

interface Props {
  collapsed: boolean;
  collapsedHover: boolean;
  sideMenuBgMode: string;
}

const getLogoSrc = (collapsed: boolean, sideMenuBgMode: string, siteInfo?: any) => {
  if (!collapsed) {
    if (sideMenuBgMode === 'light') {
      return siteInfo?.light_menu_big_logo_url || '/image/logo-light-l.png';
    }
    return siteInfo?.menu_big_logo_url || '/image/logo-l.png';
  }
  if (sideMenuBgMode === 'light') {
    return siteInfo?.light_menu_small_logo_url || '/image/logo-light.png';
  }
  return siteInfo?.menu_small_logo_url || '/image/logo.png';
};

export default function SideMenuHeader(props: Props) {
  const { collapsed, collapsedHover, sideMenuBgMode } = props;
  const { siteInfo } = useContext(CommonStateContext);

  return (
    <div className={cn('relative mt-6 h-10 w-full shrink-0 overflow-hidden transition-spacing', 'pl-3.5')}>
      <img
        src={getLogoSrc(false, sideMenuBgMode, siteInfo)}
        width={120}
        height={38}
        className='max-w-[120px]'
        style={{
          display: !collapsed || collapsedHover ? 'block' : 'none',
        }}
      />
      <img
        src={getLogoSrc(true, sideMenuBgMode, siteInfo)}
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
