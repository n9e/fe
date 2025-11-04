import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import { RightIcon } from '@/components/BusinessGroup/components/Tree/constant';
import IconFont from '@/components/IconFont';

import { IMenuItem } from './types';
import { cn, getSavedPath } from './utils';
import DeprecatedIcon from './DeprecatedIcon';

interface IMenuProps {
  collapsed: boolean;
  selectedKeys?: string[];
  onClick?: (key: any) => void;
  sideMenuBgColor: string;
  isCustomBg: boolean;
  quickMenuRef: React.MutableRefObject<{ open: () => void }>;
  isGoldTheme?: boolean;
}

export function MenuGroup(props: { item: IMenuItem } & IMenuProps) {
  const { t } = useTranslation('sideMenu');
  const { item, collapsed, selectedKeys, sideMenuBgColor, ...otherProps } = props;
  const isBlueTheme = localStorage.getItem('n9e-dark-mode') === '3';
  const keyOfChildrens =
    item.children
      ?.map((c) => {
        if (c.type === 'tabs' && c.children?.length) {
          return c.children.map((g) => g.key);
        }
        return c.key;
      })
      .flat() || [];
  const isActive = selectedKeys?.includes(item.key) || selectedKeys?.some((k) => keyOfChildrens.includes(k));
  const [isExpand, setIsExpand] = useState<boolean>(false);
  const isBgBlack = sideMenuBgColor === 'rgb(24,27,31)';
  useEffect(() => {
    if (isActive) {
      setIsExpand(true);
    }
  }, [isActive]);

  const visibleChildren = item.children?.filter((c) => c && (c.type === 'tabs' ? c.children && c.children.length > 0 : true)) || [];

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
              isActive
                ? props.isCustomBg
                  ? isBgBlack
                    ? 'text-[#ccccdc]'
                    : 'text-[#fff]'
                  : 'text-primary'
                : isBlueTheme
                ? 'bg-[#EEF6FE]'
                : props.isCustomBg
                ? ''
                : 'text-primary-80',
              !collapsed ? 'mr-4' : '',
            )}
          >
            {item.icon}
          </div>
          {!collapsed && (
            <div className={`overflow-hidden truncate text-l1 tracking-wide ${isActive ? (props.isCustomBg ? (isBgBlack ? 'text-[#fff]' : 'text-[#ccccdc]') : 'text-title') : ''}`}>
              {t(item.label)}
            </div>
          )}
        </div>
        {!collapsed && <RightIcon className={cn('transition', isExpand ? 'rotate-90' : '')} style={{ fontSize: 24 }} />}
      </div>
      <div
        className='mt-1 space-y-1 overflow-hidden transition-height'
        style={{ height: !isExpand || collapsed ? 0 : visibleChildren.length * 36 + (visibleChildren.length - 1) * 4 }}
      >
        {visibleChildren.map((c) => {
          if (c.pathType === 'absolute') {
            return (
              <AbsoluteMenuItem
                sideMenuBgColor={props.sideMenuBgColor}
                key={c.key}
                item={c}
                isSub
                collapsed={collapsed}
                selectedKeys={selectedKeys}
                isBgBlack={isBgBlack}
                {...otherProps}
              />
            );
          }
          return (
            <MenuItem sideMenuBgColor={props.sideMenuBgColor} key={c.key} item={c} isSub collapsed={collapsed} selectedKeys={selectedKeys} isBgBlack={isBgBlack} {...otherProps} />
          );
        })}
      </div>
    </div>
  );
}

export function MenuItem(props: { item: IMenuItem; isSub?: boolean; isBgBlack?: boolean } & IMenuProps) {
  const { t } = useTranslation('sideMenu');
  const isBlueTheme = localStorage.getItem('n9e-dark-mode') === '3';
  const { item, isSub = false, isCustomBg, collapsed, selectedKeys, isBgBlack, onClick, isGoldTheme } = props;
  const isActive = item.type === 'tabs' ? selectedKeys?.some((k) => item.children?.some((c) => c.key === k)) : selectedKeys?.includes(item.key);
  const path = item.type === 'tabs' ? item.children?.[0]?.key || item.key : item.key;
  const savedPath = item.children ? getSavedPath(path) : item.key;
  const activeBg = isActive ? (isBlueTheme ? 'bg-[#EEF6FE]' : isCustomBg ? '' : 'bg-fc-200') : '';
  const textColor = isActive
    ? isBlueTheme
      ? 'text-[#427AF4]'
      : props.isCustomBg
      ? isGoldTheme
        ? 'text-[#333]'
        : isBgBlack
        ? 'text-[#ccccdc]'
        : 'text-[#fff]'
      : 'text-title'
    : '';
  return (
    <Link
      to={savedPath || path}
      className={cn(
        'group flex h-9 cursor-pointer items-center relative rounded px-3.5 transition-colors transition-spacing duration-75',
        activeBg,
        isCustomBg ? 'text-[#ccccdc]' : 'text-main',
        isActive && (isBlueTheme || isGoldTheme) ? '' : isCustomBg ? 'hover:bg-[rgba(204,204,220,0.12)]' : 'hover:bg-fc-200',
      )}
      style={{ background: isActive && isGoldTheme ? '#FFBC0D' : isActive && isCustomBg ? 'rgba(204, 204, 220, 0.08)' : undefined }}
      onClick={() => onClick?.(item.key)}
    >
      {!isSub ? (
        <div
          className={cn(
            'h-4.5 children-icon2:h-4.5 children-icon2:w-4.5',
            isActive ? (props.isCustomBg ? (isBgBlack ? 'text-[#ccccdc]' : 'text-[#fff]') : 'text-title') : '',
            !collapsed ? 'mr-4' : '',
          )}
        >
          {item.icon}
        </div>
      ) : (
        !collapsed && <div className='mr-[34px]'></div>
      )}
      {!collapsed && (
        <div className={`overflow-hidden truncate text-l1 tracking-wide ${textColor}`}>
          {t(item.label)}
          {item.beta && (
            <span
              className='absolute border text-[9px] px-[3px] py-[1px] right-[5px] top-[4px] h-[18px] scale-75 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 text-yellow-700'
              style={{ lineHeight: '15px' }}
            >
              Beta
            </span>
          )}
          {item.deprecated && (
            <span className='absolute right-[0px] top-[0px]'>
              <DeprecatedIcon />
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

// 绝对路径的 MenuItem
function AbsoluteMenuItem(props: { item: IMenuItem; isSub?: boolean; isBgBlack?: boolean } & IMenuProps) {
  const { t } = useTranslation('sideMenu');
  const { item, isSub = false, isCustomBg, collapsed, onClick } = props;

  return (
    <a
      href={item.path}
      target={item.target}
      className={cn(
        'group flex h-9 cursor-pointer items-center relative rounded px-3.5 transition-colors transition-spacing duration-75',
        isCustomBg ? 'text-[#ccccdc]' : 'text-main',
        'hover:bg-[rgba(204,204,220,0.12)]',
      )}
      onClick={() => onClick?.(item.key)}
    >
      {!isSub ? (
        <div className={cn('h-4.5 children-icon2:h-4.5 children-icon2:w-4.5', !collapsed ? 'mr-4' : '')}>{item.icon}</div>
      ) : (
        !collapsed && <div className='mr-[34px]'></div>
      )}
      {!collapsed && (
        <div className={`overflow-hidden truncate text-l1 tracking-wide`}>
          {t(item.label)}
          {item.beta && (
            <span
              className='absolute border text-[9px] px-[3px] py-[1px] right-[25px] top-[4px] h-[18px] scale-75 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 text-yellow-700'
              style={{ lineHeight: '15px' }}
            >
              Beta
            </span>
          )}
          {item.deprecated && (
            <span className='absolute right-[0px] top-[0px]'>
              <DeprecatedIcon />
            </span>
          )}
        </div>
      )}
    </a>
  );
}

export default function MenuList(
  props: {
    list: IMenuItem[];
    topExtra?: React.ReactElement;
  } & IMenuProps,
) {
  const { t } = useTranslation('sideMenu');
  const { list, topExtra, ...otherProps } = props;
  const isMac = /Mac/i.test(navigator.userAgent) || navigator.platform.includes('Mac');
  return (
    <>
      <div className={cn('h-full pl-2 pr-4', props.isCustomBg ? 'text-[#e6e6e8]' : 'text-main')}>
        <Tooltip title={isMac ? t('⌘ + K') : t('Ctrl + K')} placement='right'>
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
        </Tooltip>
        {topExtra ? React.cloneElement(topExtra, { ...props }) : null}
        <div className={cn('my-2 h-px w-full', props.isCustomBg ? 'bg-white/10' : 'bg-fc-200')}></div>
        <div className='space-y-1'>
          {list
            .filter((m) => m)
            .map((menu) => {
              if (menu.children?.length) {
                return <MenuGroup key={menu.key} item={menu} {...otherProps} />;
              }
              if (menu.pathType === 'absolute') {
                return <AbsoluteMenuItem key={menu.key} item={menu} {...otherProps} />;
              }
              return <MenuItem key={menu.key} item={menu} {...otherProps} />;
            })}
        </div>
      </div>
    </>
  );
}
