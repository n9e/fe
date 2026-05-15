import React, { ReactNode, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Dropdown, Button } from 'antd';
import type { DropDownProps } from 'antd/lib/dropdown';
import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import { CommonStateContext } from '@/App';
import { getSideMenuBgColor } from '@/components/pageLayout/SideMenuColorSetting';
import { SIDE_MENU_COLORS, SideMenuColors } from '@/components/pageLayout/SideMenuColorSetting/types';
import './locale';

const ComputerSvg = () => (
  <svg width='1em' height='1em' viewBox='0 0 48 48' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>
    <rect x='19' y='32' width='10' height='9' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
    <rect x='5' y='8' width='38' height='24' rx='2' fill='none' stroke='currentColor' strokeWidth='4' />
    <path d='M22 27H26' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
    <path d='M14 41L34 41' stroke='currentColor' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
  </svg>
);

const ComputerIcon = (props: Partial<CustomIconComponentProps>) => <Icon component={ComputerSvg} {...props} />;

const DarkSvg = () => (
  <svg width='1em' height='1em' viewBox='0 0 48 48' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>
    <path
      d='M28.0527 4.41085C22.5828 5.83695 18.5455 10.8106 18.5455 16.7273C18.5455 23.7564 24.2436 29.4545 31.2727 29.4545C37.1894 29.4545 42.1631 25.4172 43.5891 19.9473C43.8585 21.256 44 22.6115 44 24C44 35.0457 35.0457 44 24 44C12.9543 44 4 35.0457 4 24C4 12.9543 12.9543 4 24 4C25.3885 4 26.744 4.14149 28.0527 4.41085Z'
      fill='none'
      stroke='currentColor'
      strokeWidth='4'
      strokeLinejoin='round'
    />
  </svg>
);

const DarkIcon = (props: Partial<CustomIconComponentProps>) => <Icon component={DarkSvg} {...props} />;

const BrightSvg = () => (
  <svg width='1em' height='1em' viewBox='0 0 48 48' fill='currentColor' xmlns='http://www.w3.org/2000/svg'>
    <path
      d='M24 37C31.1797 37 37 31.1797 37 24C37 16.8203 31.1797 11 24 11C16.8203 11 11 16.8203 11 24C11 31.1797 16.8203 37 24 37Z'
      fill='none'
      stroke='currentColor'
      strokeWidth='4'
      strokeLinejoin='round'
    />
    <path d='M24 6C25.3807 6 26.5 4.88071 26.5 3.5C26.5 2.11929 25.3807 1 24 1C22.6193 1 21.5 2.11929 21.5 3.5C21.5 4.88071 22.6193 6 24 6Z' fill='currentColor' />
    <path d='M38.5 12C39.8807 12 41 10.8807 41 9.5C41 8.11929 39.8807 7 38.5 7C37.1193 7 36 8.11929 36 9.5C36 10.8807 37.1193 12 38.5 12Z' fill='currentColor' />
    <path d='M44.5 26.5C45.8807 26.5 47 25.3807 47 24C47 22.6193 45.8807 21.5 44.5 21.5C43.1193 21.5 42 22.6193 42 24C42 25.3807 43.1193 26.5 44.5 26.5Z' fill='currentColor' />
    <path d='M38.5 41C39.8807 41 41 39.8807 41 38.5C41 37.1193 39.8807 36 38.5 36C37.1193 36 36 37.1193 36 38.5C36 39.8807 37.1193 41 38.5 41Z' fill='currentColor' />
    <path d='M24 47C25.3807 47 26.5 45.8807 26.5 44.5C26.5 43.1193 25.3807 42 24 42C22.6193 42 21.5 43.1193 21.5 44.5C21.5 45.8807 22.6193 47 24 47Z' fill='currentColor' />
    <path d='M9.5 41C10.8807 41 12 39.8807 12 38.5C12 37.1193 10.8807 36 9.5 36C8.11929 36 7 37.1193 7 38.5C7 39.8807 8.11929 41 9.5 41Z' fill='currentColor' />
    <path d='M3.5 26.5C4.88071 26.5 6 25.3807 6 24C6 22.6193 4.88071 21.5 3.5 21.5C2.11929 21.5 1 22.6193 1 24C1 25.3807 2.11929 26.5 3.5 26.5Z' fill='currentColor' />
    <path d='M9.5 12C10.8807 12 12 10.8807 12 9.5C12 8.11929 10.8807 7 9.5 7C8.11929 7 7 8.11929 7 9.5C7 10.8807 8.11929 12 9.5 12Z' fill='currentColor' />
  </svg>
);

const BrightIcon = (props: Partial<CustomIconComponentProps>) => <Icon component={BrightSvg} {...props} />;

const MODE_ICON = {
  system: <ComputerIcon />,
  light: <BrightIcon />,
  dark: <DarkIcon />,
};

interface DarkModeSelectProps {
  align?: DropDownProps['align'];
  children?: ReactNode;
  getPopupContainer?: DropDownProps['getPopupContainer'];
  overlayClassName?: string;
  placement?: DropDownProps['placement'];
  trigger?: DropDownProps['trigger'];
}

interface DarkModeMenuItemsProps {
  popupClassName?: string;
}

export function DarkModeMenuItems(props: DarkModeMenuItemsProps = {}) {
  const { popupClassName } = props;
  const { setDarkMode, setSideMenuBgMode } = useContext(CommonStateContext);
  const { t } = useTranslation('DarkModeSelect');

  return (
    <>
      <Menu.SubMenu key='light' icon={<BrightIcon />} title={t('light')} popupClassName={popupClassName}>
        <Menu.ItemGroup title={t('light_menu_title')}>
          {(Object.entries(SIDE_MENU_COLORS) as [SideMenuColors, string][]).map(([colorKey]) => (
            <Menu.Item
              key={`light-${colorKey}`}
              onClick={() => {
                setDarkMode(false);
                setSideMenuBgMode(colorKey);
              }}
            >
              {renderColorDiv(colorKey, t)}
            </Menu.Item>
          ))}
        </Menu.ItemGroup>
      </Menu.SubMenu>
      <Menu.Item key='dark' icon={<DarkIcon />} onClick={() => setDarkMode(true)}>
        {t('dark')}
      </Menu.Item>
      <Menu.Item key='system' icon={<ComputerIcon />} onClick={() => setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches)}>
        {t('system')}
      </Menu.Item>
    </>
  );
}

export default function DarkModeSelect(props: DarkModeSelectProps) {
  const { align, children, getPopupContainer, overlayClassName, placement, trigger } = props;
  const { darkMode, sideMenuBgMode } = useContext(CommonStateContext);
  const selectedThemeKey = darkMode ? 'dark' : `light-${sideMenuBgMode}`;

  return (
    <Dropdown
      align={align}
      getPopupContainer={getPopupContainer}
      overlayClassName={overlayClassName}
      placement={placement}
      trigger={trigger}
      overlay={
        <Menu selectedKeys={[selectedThemeKey]}>
          <DarkModeMenuItems />
        </Menu>
      }
    >
      {children || (
        <Button size='small' type='text'>
          {MODE_ICON[darkMode ? 'dark' : 'light']}
        </Button>
      )}
    </Dropdown>
  );
}

const renderColorDiv = (color, t, defaultColor?) => {
  return (
    <div className='flex items-center' key={color}>
      <div>
        <div className='mr-2 flex h-3 w-4 cursor-default overflow-hidden border border-solid border-fc-400'>
          <div
            className={'h-full w-1 shrink-0 border-0 border-r border-solid border-fc-300'}
            style={{
              background: getSideMenuBgColor(color === 'default' ? defaultColor || 'theme' : color),
            }}
          ></div>
          <div className='flex h-full w-full flex-1 flex-col justify-center space-y-1 bg-fc-50 px-2'>
            <div className='h-3 rounded bg-fc-100'></div>
            <div className='h-3 rounded bg-fc-100'></div>
          </div>
        </div>
      </div>
      {t('light_menu_map.' + color)}
    </div>
  );
};
