import React, { useContext } from 'react';
import { Radio } from 'antd';
import { cn } from '@/components/menu/SideMenu/utils';
import { CommonStateContext } from '@/App';
import { SIDE_MENU_COLORS, SideMenuColors } from './types';

const THEME_COLOR = 'rgb(108, 83, 177)';
export const getSideMenuBgColor = (color: SideMenuColors) => {
  switch (color) {
    case 'light':
      return '#fff';
    case 'dark':
      return '#272a38';
    case 'theme':
      return THEME_COLOR;
    default:
      return THEME_COLOR;
  }
};

export default function SideMenuColorSetting() {
  const { sideMenuBgMode, setSideMenuBgMode } = useContext(CommonStateContext);

  return (
    <div>
      <Radio.Group value={sideMenuBgMode} onChange={(e) => setSideMenuBgMode(e.target.value as SideMenuColors)}>
        <div className='mt-2 flex gap-4'>
          {Object.entries(SIDE_MENU_COLORS).map(([item, desc]) => {
            const value: SideMenuColors = item as SideMenuColors;
            const color = getSideMenuBgColor(value);

            return (
              <div key={value}>
                <Radio value={value}>{desc}</Radio>
                <div className='mt-1 flex h-12 w-20 cursor-default overflow-hidden rounded border border-solid border-fc-400'>
                  <div
                    className={cn('h-full w-6 shrink-0 border-0 border-r border-solid border-fc-300')}
                    style={{
                      background: color,
                    }}
                  ></div>
                  <div className='flex h-full w-full flex-1 flex-col justify-center space-y-1 bg-fc-50 px-2'>
                    <div className='h-4 rounded bg-fc-100'></div>
                    <div className='h-4 rounded bg-fc-100'></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Radio.Group>
    </div>
  );
}
