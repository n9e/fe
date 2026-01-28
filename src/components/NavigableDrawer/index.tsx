import React, { useEffect } from 'react';
import { Drawer } from 'antd';
import type { DrawerProps } from 'antd';
import { useTranslation } from 'react-i18next';
import './style.less';

export interface NavigableDrawerProps extends DrawerProps {
  hasPrev?: boolean;
  hasNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  /** * 是否开启“内联模式”。
   * true: Drawer 渲染在父容器内，且没有遮罩 (适合侧拉板)
   * false: 默认 Antd 行为，全屏弹出带遮罩
   */
  inlineMode?: boolean;
}

const NavigableDrawer: React.FC<NavigableDrawerProps> = ({
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  title,
  children,
  inlineMode = true, // 默认开启内联模式
  mask,
  getContainer,
  style,
  ...restProps
}) => {
  const { t } = useTranslation('navigableDrawer');
  // 计算内联模式的特定属性
  const inlineProps: Partial<DrawerProps> = inlineMode
    ? {
        mask: false, // 1. 去掉遮罩，允许点击左侧内容
        // getContainer: false, // 2. 挂载在当前父元素，而非 body
        style: {
          position: 'absolute', // 3. 绝对定位，使其只占满父容器的高度
          ...style,
        },
        // 去掉默认的关闭按钮，因为我们可能想自己控制，或者保留 Antd 的
        // 这里保留默认，但在 extra 里加了导航
      }
    : { mask, getContainer, style };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'ArrowUp' && hasPrev) onPrev?.();
      if (e.key === 'ArrowDown' && hasNext) onNext?.();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, hasPrev, hasNext, onPrev, onNext]);

  return (
    <Drawer {...restProps} {...inlineProps} title={title}>
      {children}

      {/* 底部浮动提示 */}
      <div className='navigable-drawer-hint'>{t('hint')}</div>
    </Drawer>
  );
};

export default NavigableDrawer;
