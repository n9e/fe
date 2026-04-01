import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'antd';
import getPlacements from 'antd/es/_util/placements';
import { Link } from 'react-router-dom';

import { RightIcon } from '@/components/BusinessGroup/components/Tree/constant';
import IconFont from '@/components/IconFont';

import { IMenuItem } from './types';
import { cn, getSavedPath } from './utils';
import DeprecatedIcon from './DeprecatedIcon';

/** 与 fc-firemap AppSidebar 一致：Radix Tooltip sideOffset=8，antd 用 rightTop 水平 offset 8px */
const SIDE_MENU_HOVER_TOOLTIP_PLACEMENTS = (() => {
  const base = getPlacements({ arrowPointAtCenter: false, autoAdjustOverflow: true });
  return {
    ...base,
    rightTop: { ...base.rightTop, offset: [8, 0] as [number, number] },
  };
})();

interface IMenuProps {
  collapsed: boolean;
  selectedKeys?: string[];
  onClick?: (key: any, opts?: { keepCollapsed?: boolean }) => void;
  sideMenuBgColor: string;
  isCustomBg: boolean;
  quickMenuRef: React.MutableRefObject<{ open: () => void }>;
  isGoldTheme?: boolean;
  /** 浅色默认侧栏（非自定义底、非蓝主题、非金主题） */
  isLight?: boolean;
}

function flattenMenuChildrenForHoverPanel(children: IMenuItem[]): IMenuItem[] {
  return children
    .flatMap((c) => {
      if (!c) return [];
      if (c.type === 'tabs') {
        return (c.children || []).map((tab) => ({
          ...tab,
          type: undefined,
          children: undefined,
        }));
      }
      return [c];
    })
    .filter(Boolean) as IMenuItem[];
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
        'select-none px-3.5 pt-4 pb-1 text-[10px] font-normal uppercase tracking-[0.12em]',
        !isFirst && 'mt-6',
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
    iconColor = isActive ? 'text-[var(--fc-sidemenu-item-active-text)]' : 'text-[var(--fc-sidemenu-item-icon)] group-hover:text-[var(--fc-sidemenu-item-hover-text)]';
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
      return isActive ? 'text-[var(--fc-sidemenu-item-active-text)]' : 'text-[var(--fc-sidemenu-item-text)] group-hover:text-[var(--fc-sidemenu-item-hover-text)]';
    }
    if (isActive) {
      return props.isCustomBg ? (isBgBlack ? 'text-[#fff]' : 'text-[#ccccdc]') : 'text-title';
    }
    return props.isCustomBg ? 'group-hover:text-[#fff]' : 'group-hover:text-title';
  })();

  const rowHover = isLight ? 'hover:bg-[var(--fc-sidemenu-item-hover-bg)]' : props.isCustomBg ? 'hover:bg-gray-200/20' : 'hover:bg-fc-200';

  const collapsedActiveBg = isLight ? 'bg-[var(--fc-sidemenu-item-active-bg)]' : props.isCustomBg ? 'bg-gray-200/20' : 'bg-[#E0E2EB]';

  const submenuOpen = isExpand && !collapsed && visibleChildren.length > 0;

  return (
    <div className='w-full'>
      <div
        onClick={() => {
          if (collapsed) {
            otherProps.onClick?.(item.key);
            return;
          }
          setIsExpand(!isExpand);
        }}
        className={cn(
          'group flex h-8 cursor-pointer items-center justify-between rounded-md px-3 transition-colors duration-75',
          rowHover,
          collapsed && isActive ? collapsedActiveBg : '',
        )}
      >
        <div className='flex min-w-0 flex-1 items-center gap-2.5'>
          <div className={cn('inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center children-icon2:h-[16px] children-icon2:w-[16px]', iconColor)}>{item.icon}</div>
          {!collapsed && <span className={cn('flex-1 text-left truncate text-[13px] leading-[18px] tracking-normal', titleClass)}>{t(item.label)}</span>}
        </div>
        {!collapsed && (
          <RightIcon className={cn('shrink-0 transition', isExpand ? 'rotate-90' : '', isLight ? 'text-[var(--fc-sidemenu-item-icon)]' : '')} style={{ fontSize: 24 }} />
        )}
      </div>
      <div
        className={cn(submenuOpen ? 'mt-0.5' : 'mt-0', 'overflow-hidden transition-height')}
        style={{
          height: !isExpand || collapsed ? 0 : visibleChildren.length * 30,
        }}
      >
        <div
          className={cn(
            !collapsed
              ? cn('ml-4 pl-3 pt-0.5 space-y-0.5 border-l', isLight ? 'border-fc-300/80' : props.isCustomBg ? (isBgBlack ? 'border-white/10' : 'border-white/20') : 'border-fc-300')
              : 'space-y-0',
          )}
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

  const activeBold = isActive && isSubTreeLayout ? 'font-medium' : '';

  let textColor = '';
  if (isLight) {
    textColor = isActive
      ? cn(activeBold, 'text-[var(--fc-sidemenu-item-active-text)]')
      : cn(isSubTreeLayout ? 'text-[var(--fc-sidemenu-subitem-text)]' : 'text-[var(--fc-sidemenu-item-text)]', 'group-hover:text-[var(--fc-sidemenu-item-hover-text)]');
  } else if (isActive) {
    if (isBlueTheme) {
      textColor = cn(activeBold, 'text-[#427AF4]');
    } else if (isCustomBg) {
      if (isGoldTheme) {
        textColor = cn(activeBold, 'text-[#333]');
      } else if (isBgBlack) {
        textColor = cn(activeBold, 'text-[#ccccdc]');
      } else {
        textColor = cn(activeBold, 'text-[#fff]');
      }
    } else {
      textColor = cn(activeBold, 'text-title');
    }
  } else {
    textColor = isCustomBg ? 'group-hover:text-[#fff]' : 'group-hover:text-title';
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
        'group relative flex min-w-0 cursor-pointer items-center transition-colors duration-75',
        isSubTreeLayout ? 'h-7 rounded-md' : 'h-8 rounded-md',
        isSubTreeLayout
          ? cn(
              'w-full px-3',
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
        isActive && (
          <div
            className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-full',
              isLight
                ? 'bg-[var(--fc-sidemenu-item-active-text)]'
                : isBlueTheme
                ? 'bg-[#427AF4]'
                : isGoldTheme
                ? 'bg-[#333]'
                : isCustomBg
                ? isBgBlack
                  ? 'bg-[#ccccdc]'
                  : 'bg-[#fff]'
                : 'bg-[#6E6587]',
            )}
            aria-hidden
          />
        )
      ) : !isSub ? (
        <div
          className={cn(
            'inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center children-icon2:h-[16px] children-icon2:w-[16px]',
            isLight
              ? isActive
                ? 'text-[var(--fc-sidemenu-item-active-text)]'
                : 'text-[var(--fc-sidemenu-item-icon)] group-hover:text-[var(--fc-sidemenu-item-hover-text)]'
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
        <span className={cn('flex-1 text-left truncate text-[13px] leading-[18px] tracking-normal', textColor)}>
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
        </span>
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
        'w-full px-3',
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
      className={cn('group relative flex min-w-0 cursor-pointer items-center transition-colors duration-75', isSubTreeLayout ? 'h-7 rounded-md' : 'h-9 rounded-md', rowClass)}
      onClick={() => onClick?.(item.key)}
    >
      {isSubTreeLayout ? null : !isSub ? (
        <div
          className={cn(
            'inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center children-icon2:h-[16px] children-icon2:w-[16px]',
            !collapsed ? 'mr-4' : '',
            isLight ? 'text-[var(--fc-sidemenu-item-icon)] group-hover:text-[var(--fc-sidemenu-item-hover-text)]' : '',
          )}
        >
          {item.icon}
        </div>
      ) : (
        !collapsed && <div className='mr-[34px]'></div>
      )}
      {!collapsed && (
        <span className={cn('flex-1 text-left truncate text-[13px] leading-[18px] tracking-normal')}>
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
        </span>
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

  const [activeHoverGroupKey, setActiveHoverGroupKey] = useState<string | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const closeHoverPanel = useCallback(() => {
    clearCloseTimer();
    setActiveHoverGroupKey(null);
  }, [clearCloseTimer]);

  const scheduleCloseHoverPanel = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setActiveHoverGroupKey(null);
      closeTimerRef.current = null;
    }, 150);
  }, [clearCloseTimer]);

  useEffect(() => {
    if (!activeHoverGroupKey) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeHoverPanel();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [activeHoverGroupKey, closeHoverPanel]);

  useEffect(() => {
    if (!activeHoverGroupKey) return;
    const onScroll = () => closeHoverPanel();
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [activeHoverGroupKey, closeHoverPanel]);

  return (
    <>
      <div className={cn('h-full pl-2 pr-4', isLight ? 'text-[var(--fc-sidemenu-item-text)]' : props.isCustomBg ? 'text-[#e6e6e8]' : 'text-main')}>
        <Tooltip title={props.collapsed ? null : isMac ? t('⌘ + K') : t('Ctrl + K')} placement='right' trigger={props.collapsed ? [] : ['hover']}>
          <div
            onClick={() => {
              if (props.collapsed) {
                props.onClick?.('search'); // This will trigger the expansion logic I added in SideMenu
              }
              props.quickMenuRef.current.open();
            }}
            className={cn(
              'group relative flex h-8 cursor-pointer items-center rounded-md px-3.5 transition-colors duration-75',
              isLight ? 'hover:bg-[var(--fc-sidemenu-item-hover-bg)]' : props.isCustomBg ? 'hover:bg-gray-200/20' : 'hover:bg-fc-200',
            )}
          >
            <div
              className={cn(
                'mr-2 inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center children-icon2:h-[16px] children-icon2:w-[16px]',
                isBlueTheme ? 'text-[#427AF4]' : isLight ? 'text-[var(--fc-sidemenu-item-text)]' : props.isCustomBg ? '' : 'text-[#6E6587]',
              )}
            >
              {<IconFont type='icon-ic_search_light' />}
            </div>

            <div className='overflow-hidden truncate text-[13px] leading-[18px] tracking-normal'>{t('quickJump')} </div>
          </div>
        </Tooltip>
        {topExtra ? React.cloneElement(topExtra, { ...props, isLight }) : null}
        <div className='space-y-[2px]'>
          {chunks.map((chunk, chunkIndex) => (
            <React.Fragment key={`${chunk.section ?? 'none'}-${chunkIndex}`}>
              {chunk.section ? <SectionHeader section={chunk.section} collapsed={props.collapsed} isCustomBg={props.isCustomBg} isFirst={chunkIndex === 0} /> : null}
              {chunk.items.map((menu) => {
                if (menu.children?.length) {
                  const visibleChildren = menu.children?.filter((c) => c && (c.type === 'tabs' ? c.children && c.children.length > 0 : true)) || [];
                  const hoverChildren = flattenMenuChildrenForHoverPanel(visibleChildren);
                  const hoverEnabled = props.collapsed && hoverChildren.length > 0;
                  const open = hoverEnabled && activeHoverGroupKey === menu.key;

                  const groupNode = (
                    <div
                      onMouseEnter={() => {
                        if (!hoverEnabled) return;
                        clearCloseTimer();
                        setActiveHoverGroupKey(menu.key);
                      }}
                      onMouseLeave={() => {
                        if (!hoverEnabled) return;
                        scheduleCloseHoverPanel();
                      }}
                    >
                      <MenuGroup key={menu.key} item={menu} {...otherProps} isLight={isLight} />
                    </div>
                  );

                  if (!hoverEnabled) return groupNode;

                  return (
                    <Tooltip
                      key={menu.key}
                      overlayClassName='sidemenu-hover-panel-tooltip'
                      builtinPlacements={SIDE_MENU_HOVER_TOOLTIP_PLACEMENTS}
                      placement='rightTop'
                      trigger={[]}
                      visible={open}
                      destroyTooltipOnHide
                      title={
                        <div
                          className={cn('sidemenu-hover-panel', isLight ? 'sidemenu-hover-panel--light' : 'sidemenu-hover-panel--on-dark')}
                          style={
                            isLight
                              ? undefined
                              : {
                                  background: props.sideMenuBgColor,
                                }
                          }
                          onMouseEnter={() => {
                            clearCloseTimer();
                          }}
                          onMouseLeave={() => {
                            scheduleCloseHoverPanel();
                          }}
                        >
                          <div className='sidemenu-hover-panel-group-title truncate' title={t(menu.label)}>
                            {t(menu.label)}
                          </div>
                          <div className='sidemenu-hover-panel-list'>
                            {hoverChildren.map((c) => {
                              const isItemActive = props.selectedKeys?.includes(c.key);
                              const itemClass = cn(
                                'group relative flex h-7 min-w-0 cursor-pointer items-center gap-2 rounded-md px-2 text-[13px] leading-[18px] transition-colors duration-150',
                                isItemActive
                                  ? isLight
                                    ? 'bg-[var(--fc-sidemenu-item-active-bg)] font-medium text-[var(--fc-sidemenu-item-active-text)]'
                                    : props.isCustomBg
                                    ? 'bg-[rgba(204,204,220,0.12)] font-medium text-[#e6e6e8]'
                                    : 'bg-[#E0E2EB] font-medium text-title'
                                  : isLight
                                  ? 'text-[var(--fc-text-1)] hover:bg-[var(--fc-fill-3)]'
                                  : props.isCustomBg
                                  ? 'text-[#e6e6e8] hover:bg-[rgba(204,204,220,0.12)]'
                                  : 'text-main hover:bg-fc-200',
                              );
                              const itemContent = (
                                <>
                                  <span className='flex-1 truncate'>{t(c.label)}</span>
                                  {c.beta && (
                                    <span
                                      className={cn(
                                        'ml-2 shrink-0 scale-75 text-[9px] leading-[15px]',
                                        isLight
                                          ? 'rounded-full bg-[var(--fc-sidemenu-beta-bg)] px-[6px] py-[1px] text-[var(--fc-sidemenu-beta-text)]'
                                          : 'fc-border rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 px-[3px] py-[1px] text-yellow-700',
                                      )}
                                    >
                                      Beta
                                    </span>
                                  )}
                                  {c.deprecated && (
                                    <span className='ml-1 shrink-0'>
                                      <DeprecatedIcon />
                                    </span>
                                  )}
                                </>
                              );
                              const handleClick = () => {
                                props.onClick?.(c.key, { keepCollapsed: true });
                                closeHoverPanel();
                              };
                              if (c.pathType === 'absolute') {
                                return (
                                  <a key={c.key} href={c.path} target={c.target} className={itemClass} onClick={handleClick}>
                                    {itemContent}
                                  </a>
                                );
                              }
                              return (
                                <Link key={c.key} to={c.key} className={itemClass} onClick={handleClick}>
                                  {itemContent}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      }
                    >
                      {groupNode}
                    </Tooltip>
                  );
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
