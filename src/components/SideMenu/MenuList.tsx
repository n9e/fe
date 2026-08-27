import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'antd';
import getPlacements from 'antd/es/_util/placements';
import { Link } from 'react-router-dom';
import { House } from 'lucide-react';

import { RightIcon } from '@/components/BusinessGroup/components/Tree/constant';
import IconFont from '@/components/IconFont';
import { IS_ENT } from '@/utils/constant';

import { IMenuItem } from './types';
import { cn, getMenuItemPath } from './utils';
import DeprecatedIcon from './DeprecatedIcon';

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
  onClick?: (key: any) => void;
  sideMenuBgColor: string;
  isCustomBg: boolean;
  isDarkMode?: boolean;
  quickMenuRef: React.MutableRefObject<{ open: () => void }>;
  isGoldTheme?: boolean;
  /** 浅色默认侧栏（非自定义底、非蓝主题、非金主题） */
  isLight?: boolean;
}

function getMenuGroupChildKeys(item: IMenuItem): string[] {
  return (
    (item.children
      ?.map((c) => {
        if (c.type === 'tabs' && c.children?.length) {
          return c.children.map((g) => g.key);
        }
        return c.key;
      })
      .flat()
      .filter(Boolean) as string[]) || []
  );
}

function isMenuGroupActive(item: IMenuItem, selectedKeys?: string[]): boolean {
  const keyOfChildrens = getMenuGroupChildKeys(item);
  return Boolean(selectedKeys?.includes(item.key) || selectedKeys?.some((k) => keyOfChildrens.includes(k)));
}

export function getSideMenuIconColorClass(opts: {
  isLight: boolean;
  isActive: boolean;
  isBlueTheme: boolean;
  isCustomBg: boolean;
  isBgBlack: boolean;
  isDarkMode?: boolean;
  /** 浮层内无侧栏 row 的 group-hover */
  forHoverPanel?: boolean;
}): string {
  const { isLight, isActive, isBlueTheme, isCustomBg, isBgBlack, isDarkMode, forHoverPanel } = opts;

  if (forHoverPanel === true) {
    return '';
  }

  const lightInactive = 'text-[var(--fc-sidemenu-item-icon)] group-hover:text-[var(--fc-sidemenu-item-hover-text)]';

  if (isLight) {
    return isActive ? 'text-[var(--fc-sidemenu-item-active-text)]' : lightInactive;
  }
  if (isDarkMode) {
    return isActive ? 'text-[#fff]' : 'text-link';
  }
  if (isActive) {
    if (isBlueTheme) {
      return 'text-[#427AF4]';
    }
    if (isCustomBg) {
      return isBgBlack ? 'text-[#ccccdc]' : 'text-[#fff]';
    }
    return 'text-[#6E6587]';
  }
  if (isBlueTheme) {
    return 'text-[#427AF4]';
  }
  if (isCustomBg) {
    return '';
  }
  return 'text-[#6E6587]';
}

/**
 * Collapsed top-level rows show an icon only, so the label has to come from a tooltip.
 * Sub rows live inside the hover panel, which already renders their labels.
 */
function wrapCollapsedRowWithTooltip(row: React.ReactElement, opts: { collapsed: boolean; isSub: boolean; title: React.ReactNode }) {
  if (!opts.collapsed || opts.isSub) {
    return row;
  }
  return (
    <Tooltip title={opts.title} placement='right'>
      {row}
    </Tooltip>
  );
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
        'select-none px-3.5 pt-4 pb-1 text-[11px] font-normal uppercase tracking-[0.12em]',
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
  const rootRef = useRef<HTMLDivElement | null>(null);
  const isBlueTheme = localStorage.getItem('n9e-dark-mode') === '3';
  const isActive = isMenuGroupActive(item, selectedKeys);
  const [isExpand, setIsExpand] = useState<boolean>(false);
  const isBgBlack = sideMenuBgColor === 'rgb(24,27,31)';
  useEffect(() => {
    if (isActive) {
      setIsExpand(true);
    }
  }, [isActive]);

  const visibleChildren = item.children?.filter((c) => c && (c.type === 'tabs' ? c.children && c.children.length > 0 : true)) || [];

  const iconColor = getSideMenuIconColorClass({
    isLight: Boolean(isLight),
    isActive,
    isBlueTheme,
    isCustomBg: props.isCustomBg,
    isBgBlack,
    isDarkMode: props.isDarkMode,
    forHoverPanel: false,
  });

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

  // Collapsed rail: clicking the icon jumps straight to the group's first child.
  // The hover panel stays the way to reach the remaining children.
  const collapsedTarget = collapsed ? visibleChildren[0] : undefined;

  const rowClassName = cn(
    'group flex h-8 cursor-pointer items-center justify-between rounded-md px-3 transition-colors duration-75',
    rowHover,
    collapsed && isActive ? collapsedActiveBg : '',
  );

  const rowContent = (
    <>
      <div className='flex min-w-0 flex-1 items-center gap-2.5'>
        <div className={cn('inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center children-icon2:h-[16px] children-icon2:w-[16px]', iconColor)}>{item.icon}</div>
        {!collapsed && <span className={cn('flex-1 text-left truncate text-[13px] leading-[18px] tracking-normal', titleClass)}>{t(item.label)}</span>}
      </div>
      {!collapsed && (
        <RightIcon className={cn('shrink-0 transition', isExpand ? 'rotate-90' : '', isLight ? 'text-[var(--fc-sidemenu-item-icon)]' : '')} style={{ fontSize: 24 }} />
      )}
    </>
  );

  const renderRow = () => {
    if (!collapsedTarget) {
      return (
        <div
          onClick={() => {
            // Collapsed group with no visible child: nothing to open.
            if (collapsed) return;
            setIsExpand(!isExpand);
          }}
          className={rowClassName}
        >
          {rowContent}
        </div>
      );
    }
    if (collapsedTarget.pathType === 'absolute') {
      return (
        <a href={collapsedTarget.path} target={collapsedTarget.target} className={rowClassName} onClick={() => props.onClick?.(collapsedTarget.key)}>
          {rowContent}
        </a>
      );
    }
    return (
      <Link to={getMenuItemPath(collapsedTarget)} className={rowClassName} onClick={() => props.onClick?.(collapsedTarget.key)}>
        {rowContent}
      </Link>
    );
  };

  return (
    <div className='w-full' ref={rootRef}>
      {renderRow()}
      <div
        className={cn(submenuOpen ? 'mt-0.5' : 'mt-0', 'overflow-hidden transition-height')}
        style={{
          height: !isExpand || collapsed ? 0 : visibleChildren.length * 30,
        }}
        onTransitionEnd={(e) => {
          if (e.propertyName === 'height' && submenuOpen) {
            rootRef.current?.scrollIntoView({ block: 'nearest' });
          }
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
  const to = getMenuItemPath(item);

  const isSubTreeLayout = Boolean(isSub && !collapsed);
  const iconColor = getSideMenuIconColorClass({
    isLight: Boolean(isLight),
    isActive: Boolean(isActive),
    isBlueTheme,
    isCustomBg,
    isBgBlack: Boolean(isBgBlack),
    isDarkMode: props.isDarkMode,
  });

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

  const row = (
    <Link
      to={to}
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
            iconColor,
            !collapsed ? 'mr-2' : '',
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
                  : 'fc-border rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 px-[3px] py-[1px] text-[var(--fc-yellow-9)]',
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

  return wrapCollapsedRowWithTooltip(row, { collapsed, isSub, title: t(item.label) });
}

function AbsoluteMenuItem(props: { item: IMenuItem; isSub?: boolean; isBgBlack?: boolean } & IMenuProps) {
  const { t } = useTranslation('sideMenu');
  const isBlueTheme = localStorage.getItem('n9e-dark-mode') === '3';
  const { item, isSub = false, isCustomBg, collapsed, onClick, isLight } = props;

  const isSubTreeLayout = Boolean(isSub && !collapsed);
  const iconColor = getSideMenuIconColorClass({
    isLight: Boolean(isLight),
    isActive: false,
    isBlueTheme,
    isCustomBg,
    isBgBlack: Boolean(props.isBgBlack),
    isDarkMode: props.isDarkMode,
  });

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

  const row = (
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
            !collapsed ? 'mr-2' : '',
            iconColor,
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
                  : 'fc-border rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 px-[3px] py-[1px] text-[var(--fc-yellow-9)]',
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

  return wrapCollapsedRowWithTooltip(row, { collapsed, isSub, title: t(item.label) });
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
  const isLandingActive = Boolean(props.selectedKeys?.includes('/landing'));
  const landingIconColor = getSideMenuIconColorClass({
    isLight,
    isActive: isLandingActive,
    isBlueTheme,
    isCustomBg: props.isCustomBg,
    isBgBlack: props.sideMenuBgColor === 'rgb(24,27,31)',
    isDarkMode: props.isDarkMode,
  });
  const searchIconColor = getSideMenuIconColorClass({
    isLight,
    isActive: false,
    isBlueTheme,
    isCustomBg: props.isCustomBg,
    isBgBlack: props.sideMenuBgColor === 'rgb(24,27,31)',
    isDarkMode: props.isDarkMode,
  });

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
      <div className={cn('h-full pl-2 pr-4 pb-2.5', isLight ? 'text-[var(--fc-sidemenu-item-text)]' : props.isCustomBg ? 'text-[#e6e6e8]' : 'text-main')}>
        {IS_ENT ? (
          <Link
            to='/landing'
            className={cn(
              'group relative flex min-w-0 cursor-pointer items-center transition-colors transition-spacing duration-75',
              'h-8 rounded-md',
              'px-3',
              isLight ? 'text-[var(--fc-sidemenu-item-text)]' : props.isCustomBg ? 'text-[#e6e6e8]' : 'text-main',
              isLight ? 'hover:bg-[var(--fc-sidemenu-item-hover-bg)]' : props.isCustomBg ? 'hover:bg-[rgba(204,204,220,0.12)]' : 'hover:bg-fc-200',
            )}
          >
            <div
              className={cn(
                'mr-2 inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center children-icon2:h-[16px] children-icon2:w-[16px]',
                landingIconColor,
              )}
            >
              <IconFont type='icon-ic_home_light' />
            </div>

            <div className='overflow-hidden truncate text-[13px] leading-[18px] tracking-normal'>{t('landing')} </div>
          </Link>
        ) : (
          <Link
            to='/landing'
            className={cn(
              'group relative flex min-w-0 cursor-pointer items-center transition-colors transition-spacing duration-75',
              'h-8 rounded-md',
              'px-3',
              isLight ? 'text-[var(--fc-sidemenu-item-text)]' : props.isCustomBg ? 'text-[#e6e6e8]' : 'text-main',
              isLight ? 'hover:bg-[var(--fc-sidemenu-item-hover-bg)]' : props.isCustomBg ? 'hover:bg-[rgba(204,204,220,0.12)]' : 'hover:bg-fc-200',
            )}
          >
            <div
              className={cn('inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center', !props.collapsed && 'mr-2', landingIconColor)}
            >
              <House strokeWidth={1} />
            </div>
            {!props.collapsed && <div className='overflow-hidden truncate text-[13px] leading-[18px] tracking-normal'>{t('landing')} </div>}
          </Link>
        )}
        <Tooltip title={props.collapsed ? null : isMac ? t('⌘ + K') : t('Ctrl + K')} placement='right' trigger={props.collapsed ? [] : ['hover']}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              props.quickMenuRef.current.open();
            }}
            className={cn(
              'group relative flex h-8 cursor-pointer items-center rounded-md px-3 transition-colors transition-spacing duration-75',
              isLight ? 'hover:bg-[var(--fc-sidemenu-item-hover-bg)]' : props.isCustomBg ? 'hover:bg-gray-200/20' : 'hover:bg-fc-200',
            )}
          >
            <div
              className={cn(
                'inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center children-icon2:h-[16px] children-icon2:w-[16px]',
                !props.collapsed && 'mr-2',
                searchIconColor,
              )}
            >
              {<IconFont type='icon-ic_search_light' />}
            </div>
            {!props.collapsed && <div className='overflow-hidden truncate text-[13px] leading-[18px] tracking-normal'>{t('quickJump')} </div>}
          </div>
        </Tooltip>
        {topExtra ? React.cloneElement(topExtra, { ...props, isLight }) : null}
        <div className='side-menu-section-list space-y-[2px]'>
          {chunks.map((chunk, chunkIndex) => (
            <React.Fragment key={`${chunk.section ?? 'none'}-${chunkIndex}`}>
              {chunk.section ? <SectionHeader section={chunk.section} collapsed={props.collapsed} isCustomBg={props.isCustomBg} isFirst={chunkIndex === 0} /> : null}
              {props.collapsed && chunkIndex > 0 ? (
                <div className='side-menu-collapsed-section-divider-wrap'>
                  <div className={cn('side-menu-collapsed-section-divider', props.isCustomBg ? 'side-menu-collapsed-section-divider-on-dark' : '')} />
                </div>
              ) : null}
              {chunk.items.map((menu) => {
                if (menu.children?.length) {
                  const visibleChildren = menu.children?.filter((c) => c && (c.type === 'tabs' ? c.children && c.children.length > 0 : true)) || [];
                  const hoverChildren = visibleChildren;
                  const hoverEnabled = props.collapsed && hoverChildren.length > 0;
                  const open = hoverEnabled && activeHoverGroupKey === menu.key;
                  const menuGroupActive = isMenuGroupActive(menu, props.selectedKeys);
                  const hoverPanelIconClass = getSideMenuIconColorClass({
                    isLight,
                    isActive: menuGroupActive,
                    isBlueTheme,
                    isCustomBg: props.isCustomBg,
                    isBgBlack: props.sideMenuBgColor === 'rgb(24,27,31)',
                    isDarkMode: props.isDarkMode,
                    forHoverPanel: true,
                  });

                  const groupNode = (
                    <div
                      key={menu.key}
                      onMouseEnter={() => {
                        if (!hoverEnabled) return;
                        clearCloseTimer();
                        setActiveHoverGroupKey(menu.key);
                      }}
                      onMouseLeave={() => {
                        if (!hoverEnabled) return;
                        scheduleCloseHoverPanel();
                      }}
                      onClick={() => {
                        // Navigating from the collapsed icon must not leave the panel covering the new page.
                        if (!hoverEnabled) return;
                        closeHoverPanel();
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
                          <div className='sidemenu-hover-panel-header'>
                            <div className={cn('sidemenu-hover-panel-header-icon children-icon2:h-[16px] children-icon2:w-[16px]', hoverPanelIconClass)}>{menu.icon}</div>
                            <div className='sidemenu-hover-panel-header-title' title={t(menu.label)}>
                              {t(menu.label)}
                            </div>
                          </div>
                          <div className='sidemenu-hover-panel-divider' aria-hidden />
                          <div className='sidemenu-hover-panel-list'>
                            {hoverChildren.map((c) => {
                              const isItemActive = c.type === 'tabs' ? props.selectedKeys?.some((key) => c.children?.some((child) => child.key === key)) : props.selectedKeys?.includes(c.key);
                              const itemTo = getMenuItemPath(c);
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
                                          : 'fc-border rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 px-[3px] py-[1px] text-[var(--fc-yellow-9)]',
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
                                props.onClick?.(c.key);
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
                                <Link key={c.key} to={itemTo} className={itemClass} onClick={handleClick}>
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
