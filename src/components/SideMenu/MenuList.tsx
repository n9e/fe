import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'antd';
import { Link } from 'react-router-dom';

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
  /** 浅色默认侧栏（非自定义底、非蓝主题、非金主题） */
  isLight?: boolean;
}

function chunkMenusBySection(items: IMenuItem[]) {
  const filtered = items.filter(Boolean);
  const out: { section?: IMenuItem['section']; items: IMenuItem[] }[] = [];
  for (const m of filtered) {
    const sec = m.section;
    const last = out[out.length - 1];
    if (!last || last.section !== sec) {
      out.push({ section: sec, items: [m] });
    } else {
      last.items.push(m);
    }
  }
  return out;
}

function SectionHeader(props: { section: NonNullable<IMenuItem['section']>; collapsed: boolean; isCustomBg: boolean; isFirst: boolean }) {
  const { t } = useTranslation('sideMenu');
  const { section, collapsed, isCustomBg, isFirst } = props;
  if (collapsed) {
    return null;
  }
  return (
    <div
      className={cn(
        'select-none px-3.5 text-[10px] font-normal uppercase tracking-wider',
        isFirst ? 'mt-1' : 'mt-6',
        isCustomBg ? 'text-[#e6e6e8]/55' : 'text-[var(--fc-sidemenu-section-title)]',
      )}
    >
      {t(`section.${section}`)}
    </div>
  );
}

export function MenuGroup(props: { item: IMenuItem } & IMenuProps) {
  const { t } = useTranslation('sideMenu');
  const { item, collapsed, selectedKeys, sideMenuBgColor, isLight, ...otherProps } = props;
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

  let iconColor = '';
  if (isLight) {
    iconColor = isActive ? 'text-[var(--fc-sidemenu-item-active-text)]' : 'text-[var(--fc-sidemenu-item-text)]';
  } else if (isActive) {
    if (isBlueTheme) {
      iconColor = 'text-[#427AF4]';
    } else if (props.isCustomBg) {
      if (isBgBlack) {
        iconColor = 'text-[#ccccdc]';
      } else {
        iconColor = 'text-[#fff]';
      }
    } else {
      iconColor = 'text-[#6E6587]';
    }
  } else {
    if (isBlueTheme) {
      iconColor = 'text-[#427AF4]';
    } else {
      if (props.isCustomBg) {
        iconColor = '';
      } else {
        iconColor = 'text-[#6E6587]';
      }
    }
  }

  const titleClass = (() => {
    if (isLight) {
      return isActive ? 'text-[var(--fc-sidemenu-item-active-text)]' : 'text-[var(--fc-sidemenu-item-text)]';
    }
    if (isActive) {
      return props.isCustomBg ? (isBgBlack ? 'text-[#fff]' : 'text-[#ccccdc]') : 'text-title';
    }
    return '';
  })();

  const rowHover = isLight ? 'hover:bg-[var(--fc-sidemenu-item-hover-bg)]' : props.isCustomBg ? 'hover:bg-gray-200/20' : 'hover:bg-fc-200';

  const collapsedActiveBg = isLight ? 'bg-[var(--fc-sidemenu-item-active-bg)]' : props.isCustomBg ? 'bg-gray-200/20' : 'bg-[#E0E2EB]';

  return (
    <div className='w-full'>
      <div
        onClick={() => setIsExpand(!isExpand)}
        className={cn(
          'group flex h-9 cursor-pointer items-center justify-between rounded-md px-3.5 transition-colors transition-spacing duration-75',
          rowHover,
          collapsed && isActive ? collapsedActiveBg : '',
        )}
      >
        <div className='flex min-w-0 flex-1 items-center'>
          <div className={cn('h-4.5 shrink-0 children-icon2:h-4.5 children-icon2:w-4.5', iconColor, !collapsed ? 'mr-4' : '')}>{item.icon}</div>
          {!collapsed && <div className={cn('min-w-0 flex-1 overflow-hidden truncate text-l1 tracking-wide', titleClass)}>{t(item.label)}</div>}
        </div>
        {!collapsed && (
          <RightIcon className={cn('shrink-0 transition', isExpand ? 'rotate-90' : '', isLight ? 'text-[var(--fc-sidemenu-item-icon)]' : '')} style={{ fontSize: 24 }} />
        )}
      </div>
      <div
        className={cn('mt-1 overflow-hidden transition-height', !collapsed ? 'relative' : 'space-y-1')}
        style={{
          height: !isExpand || collapsed ? 0 : visibleChildren.length * 28 + (visibleChildren.length - 1) * 4,
        }}
      >
        {!collapsed && (
          <div
            className={cn(
              'pointer-events-none absolute bottom-0 left-[20px] top-0 z-0 w-px',
              isLight && 'bg-fc-300/80',
              !isLight && props.isCustomBg && isBgBlack && 'bg-fc-500/30',
              !isLight && props.isCustomBg && !isBgBlack && 'bg-fc-300/30',
              !isLight && !props.isCustomBg && 'bg-fc-300',
            )}
            aria-hidden
          />
        )}
        <div className={cn(!collapsed ? 'relative z-[1] flex flex-col gap-1 pl-[25px]' : 'space-y-1')}>
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
                  isLight={isLight}
                  {...otherProps}
                />
              );
            }
            return (
              <MenuItem
                sideMenuBgColor={props.sideMenuBgColor}
                key={c.key}
                item={c}
                isSub
                collapsed={collapsed}
                selectedKeys={selectedKeys}
                isBgBlack={isBgBlack}
                isLight={isLight}
                {...otherProps}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function MenuItem(props: { item: IMenuItem; isSub?: boolean; isBgBlack?: boolean } & IMenuProps) {
  const { t } = useTranslation('sideMenu');
  const isBlueTheme = localStorage.getItem('n9e-dark-mode') === '3';
  const { item, isSub = false, isCustomBg, collapsed, selectedKeys, isBgBlack, onClick, isGoldTheme, isLight } = props;
  const isActive = item.type === 'tabs' ? selectedKeys?.some((k) => item.children?.some((c) => c.key === k)) : selectedKeys?.includes(item.key);
  const path = item.type === 'tabs' ? item.children?.[0]?.key || item.key : item.key;
  const savedPath = item.children ? getSavedPath(path) : item.key;

  const isSubTreeLayout = Boolean(isSub && !collapsed);

  const activeBg = isSubTreeLayout
    ? ''
    : isLight
    ? isActive
      ? 'bg-[var(--fc-sidemenu-item-active-bg)]'
      : ''
    : isActive
    ? isBlueTheme
      ? 'bg-[#EEF6FE]'
      : isCustomBg
      ? ''
      : 'bg-[#E0E2EB]'
    : '';

  let textColor = '';
  if (isLight) {
    textColor = isActive ? 'text-[var(--fc-sidemenu-item-active-text)]' : 'text-[var(--fc-sidemenu-item-text)]';
  } else if (isActive) {
    if (isBlueTheme) {
      textColor = 'text-[#427AF4]';
    } else if (isCustomBg) {
      if (isGoldTheme) {
        textColor = 'text-[#333]';
      } else if (isBgBlack) {
        textColor = 'text-[#ccccdc]';
      } else {
        textColor = 'text-[#fff]';
      }
    } else {
      textColor = 'text-title';
    }
  } else {
    textColor = '';
  }

  const rowHover = isSubTreeLayout
    ? ''
    : isActive && (isBlueTheme || isGoldTheme)
    ? ''
    : isLight
    ? isActive
      ? 'hover:bg-[var(--fc-sidemenu-item-active-bg)]'
      : 'hover:bg-[var(--fc-sidemenu-item-hover-bg)]'
    : isCustomBg
    ? 'hover:bg-[rgba(204,204,220,0.12)]'
    : 'hover:bg-fc-200';

  return (
    <Link
      to={savedPath || path}
      className={cn(
        'group relative flex min-w-0 cursor-pointer items-center transition-colors transition-spacing duration-75',
        isSubTreeLayout ? 'h-[28px] rounded-[8px]' : 'h-9 rounded-md',
        isSubTreeLayout
          ? cn(
              'mx-1.5 w-[calc(100%-0.75rem)] max-w-full min-w-0 pr-1.5',
              isLight && isActive && 'bg-[var(--fc-sidemenu-item-active-bg)] hover:bg-[var(--fc-sidemenu-item-active-bg)]',
              isLight && !isActive && 'hover:bg-[var(--fc-sidemenu-item-hover-bg)]',
              isBlueTheme && isActive && 'bg-[#EEF6FE] hover:bg-[#EEF6FE]',
              isBlueTheme && !isActive && 'hover:bg-fc-200',
              !isLight && !isBlueTheme && isCustomBg && !isActive && 'hover:bg-[rgba(204,204,220,0.12)]',
              !isLight && !isBlueTheme && !isCustomBg && !isActive && 'hover:bg-fc-200',
              !isLight && !isBlueTheme && !isCustomBg && isActive && 'bg-[#E0E2EB] hover:bg-[#E0E2EB]',
              !isLight && !isBlueTheme && isCustomBg && isActive && !isGoldTheme && 'hover:bg-[rgba(204,204,220,0.12)]',
              !isLight && !isBlueTheme && isActive && isGoldTheme && 'hover:bg-[#FFBC0D]',
              !isLight && isCustomBg && 'text-[#ccccdc]',
              !isLight && !isCustomBg && 'text-main',
            )
          : cn('px-3.5', activeBg, isLight ? (isActive ? '' : 'text-[var(--fc-sidemenu-item-text)]') : isCustomBg ? 'text-[#ccccdc]' : 'text-main', rowHover),
      )}
      style={{ background: isActive && isGoldTheme ? '#FFBC0D' : isActive && isCustomBg ? 'rgba(204, 204, 220, 0.08)' : undefined }}
      onClick={() => onClick?.(item.key)}
    >
      {isSubTreeLayout ? (
        <span className='ml-0.5 flex h-full w-1 shrink-0 items-center justify-end pr-0.5' aria-hidden>
          <span
            className={cn(
              'h-4 w-[3px] shrink-0 rounded-full',
              isActive
                ? isLight
                  ? 'bg-[var(--fc-sidemenu-item-active-text)]'
                  : isBlueTheme
                  ? 'bg-[#427AF4]'
                  : isGoldTheme
                  ? 'bg-[#333]'
                  : isCustomBg
                  ? isBgBlack
                    ? 'bg-[#ccccdc]'
                    : 'bg-[#fff]'
                  : 'bg-[#6E6587]'
                : 'bg-transparent',
            )}
          />
        </span>
      ) : !isSub ? (
        <div
          className={cn(
            'h-4.5 children-icon2:h-4.5 children-icon2:w-4.5',
            isLight
              ? isActive
                ? 'text-[var(--fc-sidemenu-item-active-text)]'
                : 'text-[var(--fc-sidemenu-item-icon)]'
              : isActive
              ? isCustomBg
                ? isBgBlack
                  ? 'text-[#ccccdc]'
                  : 'text-[#fff]'
                : 'text-title'
              : '',
            !collapsed ? 'mr-4' : '',
          )}
        >
          {item.icon}
        </div>
      ) : (
        !collapsed && <div className='mr-[34px]'></div>
      )}
      {!collapsed && (
        <div className={cn('min-w-0 flex-1 overflow-hidden truncate tracking-wide', isSubTreeLayout && !isLight ? 'text-base' : 'text-l1', textColor)}>
          {t(item.label)}
          {item.beta && (
            <span
              className={cn(
                'absolute right-[5px] top-[4px] h-[18px] scale-75 text-[9px] leading-[15px]',
                isLight
                  ? 'rounded-full bg-[var(--fc-sidemenu-beta-bg)] px-[6px] py-[1px] text-[var(--fc-sidemenu-beta-text)]'
                  : 'fc-border rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 px-[3px] py-[1px] text-yellow-700',
              )}
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

function AbsoluteMenuItem(props: { item: IMenuItem; isSub?: boolean; isBgBlack?: boolean } & IMenuProps) {
  const { t } = useTranslation('sideMenu');
  const isBlueTheme = localStorage.getItem('n9e-dark-mode') === '3';
  const { item, isSub = false, isCustomBg, collapsed, onClick, isLight } = props;

  const isSubTreeLayout = Boolean(isSub && !collapsed);

  const rowClass = isSubTreeLayout
    ? cn(
        'mx-1.5 w-[calc(100%-0.75rem)] max-w-full min-w-0 pr-1.5',
        isLight && 'text-[var(--fc-sidemenu-item-text)] hover:bg-[var(--fc-sidemenu-item-hover-bg)]',
        !isLight && isBlueTheme && 'text-main hover:bg-fc-200',
        !isLight && !isBlueTheme && isCustomBg && 'text-[#ccccdc] hover:bg-[rgba(204,204,220,0.12)]',
        !isLight && !isBlueTheme && !isCustomBg && 'text-main hover:bg-fc-200',
      )
    : isLight
    ? 'px-3.5 text-[var(--fc-sidemenu-item-text)] hover:bg-[var(--fc-sidemenu-item-hover-bg)]'
    : cn('px-3.5', isCustomBg ? 'text-[#ccccdc]' : 'text-main', 'hover:bg-[rgba(204,204,220,0.12)]');

  return (
    <a
      href={item.path}
      target={item.target}
      className={cn(
        'group relative flex min-w-0 cursor-pointer items-center transition-colors transition-spacing duration-75',
        isSubTreeLayout ? 'h-[28px] rounded-[8px]' : 'h-9 rounded-md',
        rowClass,
      )}
      onClick={() => onClick?.(item.key)}
    >
      {isSubTreeLayout ? (
        <span className='ml-0.5 flex h-full w-1 shrink-0 items-center justify-end pr-0.5' aria-hidden>
          <span className='h-4 w-[3px] shrink-0 rounded-full bg-transparent' />
        </span>
      ) : !isSub ? (
        <div className={cn('h-4.5 children-icon2:h-4.5 children-icon2:w-4.5', !collapsed ? 'mr-4' : '', isLight ? 'text-[var(--fc-sidemenu-item-icon)]' : '')}>{item.icon}</div>
      ) : (
        !collapsed && <div className='mr-[34px]'></div>
      )}
      {!collapsed && (
        <div className={cn('min-w-0 flex-1 overflow-hidden truncate tracking-wide', isSubTreeLayout && !isLight ? 'text-base' : 'text-l1')}>
          {t(item.label)}
          {item.beta && (
            <span
              className={cn(
                'absolute right-[25px] top-[4px] h-[18px] scale-75 text-[9px] leading-[15px]',
                isLight
                  ? 'rounded-full bg-[var(--fc-sidemenu-beta-bg)] px-[6px] py-[1px] text-[var(--fc-sidemenu-beta-text)]'
                  : 'fc-border rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 px-[3px] py-[1px] text-yellow-700',
              )}
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
  const isBlueTheme = localStorage.getItem('n9e-dark-mode') === '3';
  const isMac = /Mac/i.test(navigator.userAgent) || navigator.platform.includes('Mac');
  const isLight = !props.isCustomBg && !props.isGoldTheme && !isBlueTheme;

  const chunks = useMemo(() => chunkMenusBySection(list), [list]);

  return (
    <>
      <div className={cn('h-full pl-2 pr-4', isLight ? 'text-[var(--fc-sidemenu-item-text)]' : props.isCustomBg ? 'text-[#e6e6e8]' : 'text-main')}>
        <Tooltip title={isMac ? t('⌘ + K') : t('Ctrl + K')} placement='right'>
          <div
            onClick={() => props.quickMenuRef.current.open()}
            className={cn(
              'group relative flex h-9 cursor-pointer items-center rounded-md px-3.5 transition-colors transition-spacing duration-75',
              isLight ? 'hover:bg-[var(--fc-sidemenu-item-hover-bg)]' : props.isCustomBg ? 'hover:bg-gray-200/20' : 'hover:bg-fc-200',
            )}
          >
            <div
              className={cn(
                'mr-4 h-4.5 children-icon2:h-4.5 children-icon2:w-4.5',
                isBlueTheme ? 'text-[#427AF4]' : isLight ? 'text-[var(--fc-sidemenu-item-text)]' : props.isCustomBg ? '' : 'text-[#6E6587]',
              )}
            >
              {<IconFont type='icon-ic_search' />}
            </div>

            <div className='overflow-hidden truncate text-l1 tracking-wide'>{t('quickJump')} </div>
          </div>
        </Tooltip>
        {topExtra ? React.cloneElement(topExtra, { ...props, isLight }) : null}
        <div className={cn('my-2 h-px w-full', isLight ? 'bg-[var(--fc-sidemenu-border)]' : props.isCustomBg ? 'bg-white/10' : 'bg-fc-400')}></div>
        <div className='space-y-1'>
          {chunks.map((chunk, chunkIndex) => (
            <React.Fragment key={`${chunk.section ?? 'none'}-${chunkIndex}`}>
              {chunk.section ? <SectionHeader section={chunk.section} collapsed={props.collapsed} isCustomBg={props.isCustomBg} isFirst={chunkIndex === 0} /> : null}
              {chunk.items.map((menu) => {
                if (menu.children?.length) {
                  return <MenuGroup key={menu.key} item={menu} {...otherProps} isLight={isLight} />;
                }
                if (menu.pathType === 'absolute') {
                  return <AbsoluteMenuItem key={menu.key} item={menu} {...otherProps} isLight={isLight} />;
                }
                return <MenuItem key={menu.key} item={menu} {...otherProps} isLight={isLight} />;
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
