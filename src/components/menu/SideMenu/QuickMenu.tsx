import React, { forwardRef, useEffect, useImperativeHandle, useContext, useState } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { match } from 'pinyin-pro';
import { Modal } from 'antd';
import { RightOutlined, SearchOutlined } from '@ant-design/icons';
import { IMenuItem } from './types';
import { cn } from './utils';

interface Props {
  menuList: IMenuItem[];
}

interface QuickMenuItem extends IMenuItem {
  parent?: IMenuItem;
}

// 根据使用次数排序 QuickMenuitems
const sortQuickMenuItems = (items: QuickMenuItem[]) => {
  try {
    const selectedCount = JSON.parse(localStorage.getItem('selectedCount') || '{}');
    return items.sort((a, b) => {
      const aCount = selectedCount[a.key] || 0;
      const bCount = selectedCount[b.key] || 0;
      return bCount - aCount;
    });
  } catch (e) {
    console.error(e);
    return items;
  }
};

// 存储选中 key 的次数
const saveSelectedCount = (key: string) => {
  try {
    const selectedCount = JSON.parse(localStorage.getItem('selectedCount') || '{}');
    selectedCount[key] = (selectedCount[key] || 0) + 1;
    localStorage.setItem('selectedCount', JSON.stringify(selectedCount));
  } catch (e) {
    console.error(e);
  }
};

const MENU_HEIGHT = 34;

const calcVisibleMenuRange = (scrollTop) => {
  const scrollItemNum = Math.floor(scrollTop / MENU_HEIGHT);
  return [scrollItemNum + 1, scrollItemNum + 7];
};

export default forwardRef(function QuickMenu(props: Props, ref) {
  const { t } = useTranslation('menu');
  const { menuList } = props;
  const history = useHistory();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [menus, setMenus] = useState<QuickMenuItem[]>([]);
  const [lockMouseHover, setLockMouseHover] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const menusRef = React.useRef<HTMLDivElement>(null);
  const isMac = /Mac/i.test(navigator.userAgent) || navigator.platform.includes('Mac');
  const filteredMenus = _.filter(menus, (item: any) => {
    const parentName = item?.parent?.label;
    return !search || match(item.label, search) || (parentName && match(parentName, search));
  });

  useEffect(() => {
    const newMenus: QuickMenuItem[] = [];
    _.forEach(menuList, (item) => {
      if (item.children?.length) {
        _.forEach(item.children, (child) => {
          newMenus.push({ ...child, parent: item });
        });
      }
    });

    setMenus(sortQuickMenuItems(newMenus));
  }, [
    _.join(
      _.map(menuList, (item) => {
        return _.concat([item.key, _.map(item.children, (child) => child.key)]);
      }),
    ),
  ]);

  useEffect(() => {
    if (open) {
      // 500ms 后 focus，避免无法 focus 的问题，尚不清楚为什么
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 500);
    } else {
      setSearch('');
      setActiveIndex(0);
      searchInputRef.current?.blur();
    }
  }, [open]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      setLockMouseHover(true);
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      } else if (e.key === 'ArrowDown') {
        if (!open) return;
        setActiveIndex((activeIndex) => {
          if (menusRef.current) {
            if (activeIndex === -1) return -1;
            const i = activeIndex < menus.length - 1 ? activeIndex + 1 : activeIndex;
            const visibleRange = calcVisibleMenuRange(menusRef.current.scrollTop);
            if (i > visibleRange[1]) {
              menusRef.current.scrollTop = menusRef.current.scrollTop + MENU_HEIGHT;
            }
            return i;
          }
          return activeIndex;
        });
      } else if (e.key === 'ArrowUp') {
        if (!open) return;
        setActiveIndex((activeIndex) => {
          if (menusRef.current) {
            if (activeIndex === -1) return -1;
            const i = activeIndex == 0 ? 0 : activeIndex - 1;
            const visibleRange = calcVisibleMenuRange(menusRef.current.scrollTop);
            if (i < visibleRange[0]) {
              menusRef.current.scrollTop = menusRef.current.scrollTop - MENU_HEIGHT;
            }
            return i;
          }
          return activeIndex;
        });
      } else if (e.key === 'Enter') {
        if (!open) return;
        if (activeIndex > -1) {
          const item = filteredMenus[activeIndex] as QuickMenuItem;
          setOpen(false);
          history.push(item.key);
          saveSelectedCount(item.key);
        }
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [activeIndex, menus, open, _.join(_.map(filteredMenus, 'key'))]);

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
  }));

  return (
    <Modal
      className='quick-menu-modal'
      visible={open}
      onCancel={() => {
        setOpen(false);
      }}
      bodyStyle={{
        padding: 0,
      }}
      closeIcon={null}
      footer={
        <div className='flex justify-end py-2 pr-2'>
          <div className='flex items-center'>
            <span className='text-hint'>{t('quickOpenClose')}</span>
            <div className='ml-2 mr-1 rounded-sm bg-fc-200 px-1'>{isMac ? '⌘' : 'Ctrl'}</div>
            <div className='rounded-sm bg-fc-200 px-1.5'>K</div>
          </div>
        </div>
      }
    >
      <div>
        <div className='flex items-center border-b border-fc-200 px-3'>
          <SearchOutlined className='mr-2 h-4 w-4 children-icon:h-4 children-icon:w-4 shrink-0 opacity-50' />
          <input
            ref={searchInputRef}
            className='border-none flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-hint disabled:cursor-not-allowed disabled:opacity-50'
            placeholder={t('quickSearchPlaceholder')}
            value={search}
            onChange={(e) => {
              setActiveIndex(0);
              setSearch(e.target.value);
              if (menusRef.current) {
                menusRef.current.scrollTop = 0;
              }
            }}
          />
        </div>
        <div className='p-2 overflow-hidden text-slate-950' onMouseMove={() => setLockMouseHover(false)}>
          <div className='font-bold pl-2.5 pb-1'>{t('quickMenus')}</div>
          <div className='overflow-auto h-[300px] text-sm' ref={menusRef}>
            {_.map(filteredMenus, (item: QuickMenuItem, idx) => {
              const { parent: { label: parentName, icon: parentIcon } = {} } = item;
              return (
                <div
                  key={item.key}
                  className={cn('flex items-center p-2 cursor-pointer rounded', activeIndex === idx ? 'bg-fc-200' : '')}
                  onClick={() => {
                    setOpen(false);
                    history.push(item.key);
                    saveSelectedCount(item.key);
                  }}
                  onMouseOver={() => {
                    if (lockMouseHover) return;
                    setActiveIndex(idx);
                  }}
                >
                  <div className='mr-2 text-main h-4 w-4 children-icon2:h-4 children-icon2:w-4'>{parentIcon || item.icon}</div>
                  {parentName && (
                    <>
                      <div>{parentName}</div>
                      <RightOutlined className='mx-1 h-2.5 w-2.5 children-icon:h-2.5 children-icon:w-2.5' />
                    </>
                  )}
                  <div>{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
});
