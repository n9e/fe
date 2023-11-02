import React from 'react';
import { cn } from '@/components/menu/SideMenu/utils';

export default function SideMenuHeader(props: { collapsed: boolean; sideMenuBgColor: string; isCustomBg: boolean }) {
  const { collapsed, sideMenuBgColor, isCustomBg } = props;

  return (
    <div className={cn('relative mt-6 h-10 w-full shrink-0 overflow-hidden transition-spacing', collapsed ? 'pl-3.5' : 'pl-6')}>
      <img src='/image/logo-l.png' width={120} height={40} className='max-w-[120px]' />
      {collapsed && <div className='absolute right-0 top-0 h-full w-3' style={{ background: sideMenuBgColor }}></div>}
    </div>
  );
}
