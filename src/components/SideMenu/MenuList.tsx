import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'antd';
import { Link } from 'react-router-dom';

import { RightIcon } from '@/components/BusinessGroup/components/Tree/constant';
import IconFont from '@/components/IconFont';

import { IMenuItem } from './types';
import { cn, getSavedPath } from './utils';
import DeprecatedIcon from './DeprecatedIcon';

// ─── Theme System ────────────────────────────────────────────────────

interface MenuTheme {
  text: string;
  activeText: string;
  activeBg: string;
  hoverBg: string;
  icon: string;
  activeIcon: string;
  indicator: string;
  sectionTitle: string;
  treeLine: string;
  betaBg: string;
  betaText: string;
  /** custom active bg via inline style (for gold/custom themes that need opacity) */
  activeStyleBg?: string;
}

function useMenuTheme(opts: {
  sideMenuBgMode: string;
  isGoldTheme?: boolean;
}): MenuTheme {
  const { sideMenuBgMode, isGoldTheme } = opts;
  const isBlueTheme = localStorage.getItem('n9e-dark-mode') === '3';
  const isDark = sideMenuBgMode === 'dark';
  const isCustomBg = sideMenuBgMode !== 'light';
  const isLight = !isCustomBg && !isGoldTheme && !isBlueTheme;

  if (isLight) {
    return {
      text: 'text-[var(--fc-sidemenu-item-text)]',
      activeText: 'text-[var(--fc-sidemenu-item-active-text)]',
      activeBg: 'bg-[var(--fc-sidemenu-item-active-bg)]',
      hoverBg: 'hover:bg-[var(--fc-sidemenu-item-hover-bg)]',
      icon: 'text-[var(--fc-sidemenu-item-icon)]',
      activeIcon: 'text-[var(--fc-sidemenu-item-active-text)]',
      indicator: 'bg-[var(--fc-sidemenu-item-active-text)]',
      sectionTitle: 'text-[var(--fc-sidemenu-section-title)]',
      treeLine: 'bg-fc-300/80',
      betaBg: 'rounded-full bg-[var(--fc-sidemenu-beta-bg)] px-[6px] py-[1px] text-[var(--fc-sidemenu-beta-text)]',
      betaText: 'text-[var(--fc-sidemenu-beta-text)]',
    };
  }

  if (isBlueTheme) {
    return {
      text: 'text-main',
      activeText: 'text-[var(--fc-sidemenu-blue-accent)]',
      activeBg: 'bg-[var(--fc-sidemenu-blue-active-bg)]',
      hoverBg: 'hover:bg-fc-200',
      icon: 'text-[var(--fc-sidemenu-blue-accent)]',
      activeIcon: 'text-[var(--fc-sidemenu-blue-accent)]',
      indicator: 'bg-[var(--fc-sidemenu-blue-accent)]',
      sectionTitle: 'text-[var(--fc-sidemenu-section-title)]',
      treeLine: 'bg-fc-300',
      betaBg: 'fc-border rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 px-[3px] py-[1px] text-yellow-700',
      betaText: 'text-yellow-700',
    };
  }

  if (isGoldTheme) {
    return {
      text: 'text-[var(--fc-sidemenu-custom-text)]',
      activeText: 'text-[var(--fc-sidemenu-gold-text)]',
      activeBg: '',
      hoverBg: 'hover:bg-[var(--fc-sidemenu-custom-hover-bg)]',
      icon: '',
      activeIcon: 'text-[var(--fc-sidemenu-gold-text)]',
      indicator: 'bg-[var(--fc-sidemenu-gold-text)]',
      sectionTitle: 'text-[var(--fc-sidemenu-custom-section-title)]',
      treeLine: isDark ? 'bg-fc-500/30' : 'bg-fc-300/30',
      betaBg: 'fc-border rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 px-[3px] py-[1px] text-yellow-700',
      betaText: 'text-yellow-700',
      activeStyleBg: 'var(--fc-sidemenu-gold-accent)',
    };
  }

  if (isCustomBg) {
    return {
      text: 'text-[var(--fc-sidemenu-custom-text)]',
      activeText: isDark ? 'text-[var(--fc-sidemenu-custom-text-bright)]' : 'text-[var(--fc-sidemenu-custom-text-bright)]',
      activeBg: '',
      hoverBg: 'hover:bg-[var(--fc-sidemenu-custom-hover-bg)]',
      icon: '',
      activeIcon: isDark ? 'text-[var(--fc-sidemenu-custom-text-bright)]' : 'text-[var(--fc-sidemenu-custom-text-bright)]',
      indicator: isDark ? 'bg-[var(--fc-sidemenu-custom-text-bright)]' : 'bg-[var(--fc-sidemenu-custom-text-bright)]',
      sectionTitle: 'text-[var(--fc-sidemenu-custom-section-title)]',
      treeLine: isDark ? 'bg-fc-500/30' : 'bg-fc-300/30',
      betaBg: 'fc-border rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 px-[3px] py-[1px] text-yellow-700',
      betaText: 'text-yellow-700',
      activeStyleBg: 'var(--fc-sidemenu-custom-active-bg)',
    };
  }

  // default (non-light, non-custom, non-blue, non-gold — fallback)
  return {
    text: 'text-main',
    activeText: 'text-title',
    activeBg: 'bg-[var(--fc-sidemenu-default-active-bg)]',
    hoverBg: 'hover:bg-fc-200',
    icon: 'text-[var(--fc-sidemenu-custom-indicator)]',
    activeIcon: 'text-title',
    indicator: 'bg-[var(--fc-sidemenu-custom-indicator)]',
    sectionTitle: 'text-[var(--fc-sidemenu-section-title)]',
    treeLine: 'bg-fc-300',
    betaBg: 'fc-border rounded-full bg-gradient-to-r from-yellow-400 to-yellow-300 px-[3px] py-[1px] text-yellow-700',
    betaText: 'text-yellow-700',
  };
}

// ─── Props ───────────────────────────────────────────────────────────

interface IMenuProps {
  collapsed: boolean;
  selectedKeys?: string[];
  onClick?: (key: any) => void;
  sideMenuBgColor: string;
  sideMenuBgMode: string;
  isCustomBg: boolean;
  quickMenuRef: React.MutableRefObject<{ open: () => void }>;
  isGoldTheme?: boolean;
  theme: MenuTheme;
}

// ─── Helpers ─────────────────────────────────────────────────────────

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

function SectionHeader(props: { section: NonNullable<IMenuItem['section']>; collapsed: boolean; theme: MenuTheme; isFirst: boolean }) {
  const { t } = useTranslation('sideMenu');
  const { section, collapsed, theme, isFirst } = props;
  if (collapsed) return null;
  return (
    <div className={cn('select-none px-3.5 text-[10px] font-normal uppercase tracking-wider', isFirst ? 'mt-1' : 'mt-6', theme.sectionTitle)}>
      {t(`section.${section}`)}
    </div>
  );
}

// ─── MenuGroup ───────────────────────────────────────────────────────

export function MenuGroup(props: { item: IMenuItem } & IMenuProps) {
  const { t } = useTranslation('sideMenu');
  const { item, collapsed, selectedKeys, theme, sideMenuBgColor: _c, sideMenuBgMode: _m, ...otherProps } = props;
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

  useEffect(() => {
    if (isActive) setIsExpand(true);
  }, [isActive]);

  const visibleChildren = item.children?.filter((c) => c && (c.type === 'tabs' ? c.children && c.children.length > 0 : true)) || [];

  const iconColor = isActive ? theme.activeIcon : theme.icon;
  const titleClass = isActive ? theme.activeText : theme.text;

  return (
    <div className='w-full'>
      <div
        onClick={() => setIsExpand(!isExpand)}
        className={cn(
          'group flex h-9 cursor-pointer items-center justify-between rounded-md px-3.5 transition-colors transition-spacing duration-75',
          theme.hoverBg,
          collapsed && isActive ? theme.activeBg : '',
        )}
      >
        <div className='flex min-w-0 flex-1 items-center'>
          <div className={cn('h-4.5 shrink-0 children-icon2:h-4.5 children-icon2:w-4.5', iconColor, !collapsed ? 'mr-1' : '')}>{item.icon}</div>
          {!collapsed && <div className={cn('min-w-0 flex-1 overflow-hidden truncate text-[13px] leading-5 tracking-wide', titleClass)}>{t(item.label)}</div>}
        </div>
        {!collapsed && <RightIcon className={cn('shrink-0 transition', isExpand ? 'rotate-90' : '', theme.icon)} style={{ fontSize: 24 }} />}
      </div>
      <div
        className={cn('mt-1 overflow-hidden transition-height', !collapsed ? 'relative' : 'space-y-1')}
        style={{ height: !isExpand || collapsed ? 0 : visibleChildren.length * 28 + (visibleChildren.length - 1) * 4 }}
      >
        {!collapsed && (
          <div className={cn('pointer-events-none absolute bottom-0 left-[20px] top-0 z-0 w-px', theme.treeLine)} aria-hidden />
        )}
        <div className={cn(!collapsed ? 'relative z-[1] flex flex-col gap-1 pl-[25px]' : 'space-y-1')}>
          {visibleChildren.map((c) => (
            <MenuItem
              sideMenuBgColor={props.sideMenuBgColor}
              sideMenuBgMode={props.sideMenuBgMode}
              key={c.key}
              item={c}
              isSub
              collapsed={collapsed}
              selectedKeys={selectedKeys}
              theme={theme}
              {...otherProps}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MenuItem (handles both internal <Link> and external <a>) ────────

export function MenuItem(props: { item: IMenuItem; isSub?: boolean } & IMenuProps) {
  const { t } = useTranslation('sideMenu');
  const { item, isSub = false, collapsed, selectedKeys, onClick, theme } = props;
  const isActive = item.type === 'tabs' ? selectedKeys?.some((k) => item.children?.some((c) => c.key === k)) : selectedKeys?.includes(item.key);
  const path = item.type === 'tabs' ? item.children?.[0]?.key || item.key : item.key;
  const savedPath = item.children ? getSavedPath(path) : item.key;
  const isExternal = item.pathType === 'absolute';

  const isSubTreeLayout = Boolean(isSub && !collapsed);

  // Active background
  const activeBg = isSubTreeLayout ? '' : isActive ? theme.activeBg : '';

  // Text color
  const textColor = isActive ? theme.activeText : theme.text;

  // Row hover
  const rowHover = isSubTreeLayout ? '' : theme.hoverBg;

  // Submenu tree layout classes
  const subTreeClass = isSubTreeLayout
    ? cn(
        'mx-1.5 w-[calc(100%-0.75rem)] max-w-full min-w-0 pr-1.5',
        isActive ? cn(theme.activeBg, theme.activeBg ? `hover:${theme.activeBg.replace('bg-', 'bg-')}` : theme.hoverBg) : theme.hoverBg,
        theme.text,
      )
    : cn('px-3.5', activeBg, theme.text, rowHover);

  // Inline style for themes that use opacity-based active bg (gold, custom)
  const activeStyleBg = isActive && !isSubTreeLayout && theme.activeStyleBg ? { background: theme.activeStyleBg } : undefined;
  const subActiveStyleBg = isActive && isSubTreeLayout && theme.activeStyleBg ? { background: theme.activeStyleBg } : undefined;

  const className = cn(
    'group relative flex min-w-0 cursor-pointer items-center transition-colors transition-spacing duration-75',
    isSubTreeLayout ? 'h-[28px] rounded-[8px]' : 'h-9 rounded-md',
    subTreeClass,
  );

  const content = (
    <>
      {isSubTreeLayout ? (
        <span className='ml-0.5 flex h-full w-1 shrink-0 items-center justify-end pr-0.5 mr-0.5' aria-hidden>
          <span className={cn('h-4 w-[3px] shrink-0 rounded-full', isActive ? theme.indicator : 'bg-transparent')} />
        </span>
      ) : !isSub ? (
        <div className={cn('h-4.5 children-icon2:h-4.5 children-icon2:w-4.5', isActive ? theme.activeIcon : theme.icon, !collapsed ? 'mr-4' : '')}>
          {item.icon}
        </div>
      ) : (
        !collapsed && <div className='mr-[34px]'></div>
      )}
      {!collapsed && (
        <div className={cn('min-w-0 flex-1 overflow-hidden truncate text-[13px] leading-5 tracking-wide', isActive ? theme.activeText : '')}>
          {t(item.label)}
          {item.beta && (
            <span className={cn('absolute right-[5px] top-[4px] h-[18px] scale-75 text-[9px] leading-[15px]', theme.betaBg)}>
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
    </>
  );

  if (isExternal) {
    return (
      <a href={item.path} target={item.target} className={className} style={subActiveStyleBg || activeStyleBg} onClick={() => onClick?.(item.key)}>
        {content}
      </a>
    );
  }

  return (
    <Link to={savedPath || path} className={className} style={subActiveStyleBg || activeStyleBg} onClick={() => onClick?.(item.key)}>
      {content}
    </Link>
  );
}

// ─── MenuList (root) ─────────────────────────────────────────────────

export default function MenuList(
  props: {
    list: IMenuItem[];
    topExtra?: React.ReactElement;
    sideMenuBgMode: string;
  } & Omit<IMenuProps, 'theme' | 'sideMenuBgMode'>,
) {
  const { t } = useTranslation('sideMenu');
  const { list, topExtra, sideMenuBgMode, ...otherProps } = props;
  const isMac = /Mac/i.test(navigator.userAgent) || navigator.platform.includes('Mac');

  const theme = useMenuTheme({ sideMenuBgMode, isGoldTheme: props.isGoldTheme });

  const chunks = useMemo(() => chunkMenusBySection(list), [list]);

  return (
    <>
      <div className={cn('h-full pl-2 pr-4', theme.text)}>
        <Tooltip title={isMac ? t('⌘ + K') : t('Ctrl + K')} placement='right'>
          <div
            onClick={() => props.quickMenuRef.current.open()}
            className={cn('group relative flex h-9 cursor-pointer items-center rounded-md px-3.5 transition-colors transition-spacing duration-75', theme.hoverBg)}
          >
            <div className={cn('mr-1 h-4.5 children-icon2:h-4.5 children-icon2:w-4.5', theme.icon)}>
              {<IconFont type='icon-ic_search' />}
            </div>
            <div className='overflow-hidden truncate text-[13px] leading-5 tracking-wide'>{t('quickJump')} </div>
          </div>
        </Tooltip>
        {topExtra ? React.cloneElement(topExtra, { ...props, theme }) : null}
        <div className='space-y-1'>
          {chunks.map((chunk, chunkIndex) => (
            <React.Fragment key={`${chunk.section ?? 'none'}-${chunkIndex}`}>
              {chunk.section ? <SectionHeader section={chunk.section} collapsed={props.collapsed} theme={theme} isFirst={chunkIndex === 0} /> : null}
              {chunk.items.map((menu) => {
                if (menu.children?.length) {
                  return <MenuGroup key={menu.key} item={menu} {...otherProps} sideMenuBgMode={sideMenuBgMode} theme={theme} />;
                }
                return <MenuItem key={menu.key} item={menu} {...otherProps} sideMenuBgMode={sideMenuBgMode} theme={theme} />;
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
