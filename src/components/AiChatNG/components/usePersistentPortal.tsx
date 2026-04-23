import { useRef, useEffect, useCallback, useState } from 'react';
import ReactDOM from 'react-dom';

/**
 * 在一个固定的 DOM 容器中渲染 children，然后通过原生 DOM
 * appendChild 把该容器搬到不同的宿主节点中。
 *
 * 与 createPortal(children, changingTarget) 不同的是：
 * 切换宿主时 React 子树 **不会** unmount/remount，所有内部
 * state、ref、进行中的请求都完整保留。
 */
export function usePersistentPortal() {
  const hostRef = useRef<HTMLElement | null>(null);
  const [container] = useState(() => {
    const div = document.createElement('div');
    div.style.height = '100%';
    return div;
  });

  // 仅记录"曾经发生过滚动"的元素及其最新滚动位置：
  // 1) 没滚动过的元素 scrollTop 一定为 0，宿主切换后无需恢复；
  // 2) 切换时直接遍历该集合即可，避免 querySelectorAll('*') 全量扫描，
  //    也避免对每个后代读取 scrollTop 触发同步 reflow。
  const scrollMapRef = useRef<Map<HTMLElement, { top: number; left: number }>>(new Map());

  const rafIdsRef = useRef<number[]>([]);

  const cancelPendingRestores = useCallback(() => {
    for (let i = 0; i < rafIdsRef.current.length; i++) {
      cancelAnimationFrame(rafIdsRef.current[i]);
    }
    rafIdsRef.current = [];
  }, []);

  useEffect(() => {
    const onScroll = (e: Event) => {
      const el = e.target;
      if (!(el instanceof HTMLElement)) return;
      if (!container.contains(el)) return;
      scrollMapRef.current.set(el, { top: el.scrollTop, left: el.scrollLeft });
    };
    // 滚动事件不冒泡，必须在 capture 阶段全局监听
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [container]);

  const setHost = useCallback(
    (node: HTMLElement | null) => {
      if (node === hostRef.current) return;
      hostRef.current = node;
      if (!node || container.parentElement === node) return;

      cancelPendingRestores();

      const snapshots: { el: HTMLElement; top: number; left: number }[] = [];
      scrollMapRef.current.forEach((pos, el) => {
        if (!container.contains(el)) {
          scrollMapRef.current.delete(el);
          return;
        }
        if (pos.top > 0 || pos.left > 0) {
          snapshots.push({ el, top: pos.top, left: pos.left });
        }
      });

      node.appendChild(container);

      if (snapshots.length === 0) return;

      const restore = () => {
        for (let i = 0; i < snapshots.length; i++) {
          const { el, top, left } = snapshots[i];
          // 仅当浏览器已把 scrollTop 重置 / 裁剪掉时才回写，
          // 避免覆盖用户在恢复期间的真实滚动操作
          if (el.scrollTop !== top) el.scrollTop = top;
          if (el.scrollLeft !== left) el.scrollLeft = left;
        }
      };

      // 立即恢复一次（多数场景已足够），再在接下来两帧兜底：
      // 切换到 floating 时新宿主刚从 display:none 解除，布局可能
      // 尚未在当前帧内完成，立即写入的 scrollTop 会被裁剪到 0。
      restore();
      const id1 = requestAnimationFrame(() => {
        restore();
        const id2 = requestAnimationFrame(restore);
        rafIdsRef.current.push(id2);
      });
      rafIdsRef.current.push(id1);
    },
    [container, cancelPendingRestores],
  );

  useEffect(() => {
    return () => {
      cancelPendingRestores();
      scrollMapRef.current.clear();
      container.remove();
    };
  }, [container, cancelPendingRestores]);

  const render = useCallback(
    (children: React.ReactNode) => {
      return ReactDOM.createPortal(children, container);
    },
    [container],
  );

  return { setHost, render };
}
