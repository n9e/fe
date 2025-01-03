import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import { RightIcon } from '@/components/BusinessGroup/components/Tree/constant';
import { IMenuItem } from './types';
import { cn } from './utils';
import IconFont from '../../IconFont';

interface IMenuProps {
  collapsed: boolean;
  selectedKeys?: string[];
  onClick?: (key: any) => void;
  sideMenuBgColor: string;
  isCustomBg: boolean;
  quickMenuRef: React.MutableRefObject<{ open: () => void }>;
}

function MenuGroup(props: { item: IMenuItem } & IMenuProps) {
  const { item, collapsed, selectedKeys, sideMenuBgColor, ...otherProps } = props;
  const keyOfChildrens = item.children?.map((c) => c.key) || [];
  const isActive = selectedKeys?.includes(item.key) || selectedKeys?.some((k) => keyOfChildrens.includes(k));
  const [isExpand, setIsExpand] = useState<boolean>(false);
  const isBgBlack = sideMenuBgColor === 'rgb(24,27,31)';
  useEffect(() => {
    if (isActive) {
      setIsExpand(true);
    }
  }, [isActive]);

  return (
    <div className='w-full'>
      <div
        onClick={() => setIsExpand(!isExpand)}
        className={cn(
          'group flex h-9 cursor-pointer items-center justify-between rounded px-3.5 transition-colors transition-spacing duration-75',
          props.isCustomBg ? 'hover:bg-gray-200/20' : 'hover:bg-fc-200',
          collapsed && isActive ? (props.isCustomBg ? 'bg-gray-200/20' : 'bg-fc-200') : '',
        )}
      >
        <div className='flex items-center'>
          <div
            className={cn(
              'h-4.5 children-icon2:h-4.5 children-icon2:w-4.5',
              isActive ? (props.isCustomBg ? isBgBlack? 'text-[#ccccdc]': 'text-[#fff]' : 'text-primary') : props.isCustomBg ? '' : 'text-primary-80',
              !collapsed ? 'mr-4' : '',
            )}
          >
            {item.icon}
          </div>
          {!collapsed && <div className={`overflow-hidden truncate text-l1 tracking-wide ${isActive ? (props.isCustomBg ? isBgBlack? 'text-[#fff]' : 'text-[#ccccdc]' : 'text-title') : ''}`}>{item.label}</div>}
        </div>
        {!collapsed && <RightIcon className={cn('transition', isExpand ? 'rotate-90' : '')} style={{ fontSize: 24 }} />}
      </div>
      <div
        className='mt-1 space-y-1 overflow-hidden transition-height'
        style={{ height: !isExpand || collapsed ? 0 : keyOfChildrens.length * 36 + (keyOfChildrens.length - 1) * 4 }}
      >
        {item.children?.map((c) => (
          <MenuItem sideMenuBgColor={props.sideMenuBgColor} key={c.key} item={c} isSub collapsed={collapsed} selectedKeys={selectedKeys} isBgBlack={isBgBlack} {...otherProps} />
        ))}
      </div>
    </div>
  );
}

function MenuItem(props: { item: IMenuItem; isSub?: boolean, isBgBlack?:boolean  } & IMenuProps) {
  const { item, isSub = false, isCustomBg, collapsed, selectedKeys,isBgBlack, onClick } = props;
  const isActive = selectedKeys?.includes(item.key);
  return (
    <Link
      to={item.key}
      className={cn(
        'group flex h-9 cursor-pointer items-center relative rounded px-3.5 transition-colors transition-spacing duration-75',
        isActive ? (isCustomBg ? '' : 'bg-fc-200') : '',
        isCustomBg ? 'text-[#ccccdc]' : 'text-main',
        'hover:bg-[rgba(204,204,220,0.12)]',
      )}
      style={{background: isActive && isCustomBg ?'rgba(204, 204, 220, 0.08)':undefined }}
    >
      {!isSub ? (
        <div className={cn('h-4.5 children-icon2:h-4.5 children-icon2:w-4.5', isActive ? (props.isCustomBg ? isBgBlack? 'text-[#ccccdc]': 'text-[#fff]' : 'text-title') : '', !collapsed ? 'mr-4' : '')}>
          {item.icon}
        </div>
      ) : (
        !collapsed && <div className='mr-[34px]'></div>
      )}
      {!collapsed && (
        <div className={`overflow-hidden truncate text-l1 tracking-wide ${isActive ? (props.isCustomBg ? 'text-[#fff]' : 'text-title') : ''}`}>
          {item.label}{' '}
          {item.beta && (
            <span
              className='absolute border text-[9px] px-[3px] py-[1px] right-[25px] top-[4px] h-[18px] scale-75 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 text-yellow-700'
              style={{ lineHeight: '15px' }}
            >
              Beta
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

export default function MenuList(
  props: {
    list: IMenuItem[];
  } & IMenuProps,
) {
  const { t } = useTranslation('menu');
  const { list, ...otherProps } = props;

  return (
    <>
      <div className={cn('h-full pl-2 pr-4', props.isCustomBg ? 'text-[#e6e6e8]' : 'text-main')}>
        <div
          onClick={() => props.quickMenuRef.current.open()}
          className={cn(
            'group flex h-9 cursor-pointer items-center relative rounded px-3.5 transition-colors transition-spacing duration-75',
            props.isCustomBg ? 'hover:bg-gray-200/20' : 'hover:bg-fc-200',
          )}
        >
          <div className={cn('h-4.5 children-icon2:h-4.5 children-icon2:w-4.5 mr-4', props.isCustomBg ? '' : 'text-primary-80')}>{<IconFont type='icon-Menu_Search' />}</div>
          <div className={`overflow-hidden truncate text-l1 tracking-wide`}>{t('quickJump')} </div>
        </div>
        <div className={cn('my-2 h-px w-full', props.isCustomBg ? 'bg-white/10' : 'bg-fc-200')}></div>
        <div className='space-y-1'>
          {list
            .filter((m) => m)
            .map((menu) => {
              if (menu.children?.length) {
                return <MenuGroup key={menu.key} item={menu} {...otherProps} />;
              }
              return <MenuItem key={menu.key} item={menu} {...otherProps} />;
            })}
        </div>
      </div>
    </>
  );
}
