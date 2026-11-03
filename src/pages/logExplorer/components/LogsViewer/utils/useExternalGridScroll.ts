import { RefObject, useLayoutEffect, useRef, useState } from 'react';
import type { DataGridHandle } from 'react-data-grid';
import useScrollParent from './useScrollParent';
import { getScrollViewport, getScrollEventTarget, getPinnedLogHeight } from './scrollParent';

/** Keep RDG's virtual viewport, but let the page own all vertical wheel/touch scrolling.
 * The full-height shell contributes the rows' height to the page. Its sticky grid
 * renders only the visible rows, with scrollTop driven by the page's position.
 */
export default function useExternalGridScroll(shellRef: RefObject<HTMLDivElement>, gridRef: RefObject<DataGridHandle>, contentHeight: number) {
  const parent = useScrollParent(shellRef);
  const [top, setTop] = useState(0);
  const [height, setHeight] = useState(35);
  const [scrollbarHeight, setScrollbarHeight] = useState(0);
  const expectedTop = useRef(0);
  useLayoutEffect(() => {
    const shell = shellRef.current;
    const grid = gridRef.current?.element;
    if (!shell || !grid || !parent) return;
    const sync = () => {
      setTop(getPinnedLogHeight(shell, parent));
      // Include native horizontal scrollbar space in the page's total height.
      const gutter = Math.max(0, grid.offsetHeight - grid.clientHeight - 2);
      setScrollbarHeight(gutter);
      const viewportHeight = Math.min(contentHeight + gutter, Math.max(35, getScrollViewport(parent, shell).height));
      setHeight(viewportHeight);
      const offset = getScrollViewport(parent, shell).top - shell.getBoundingClientRect().top;
      expectedTop.current = Math.max(0, Math.min(grid.scrollHeight - grid.clientHeight, offset));
      grid.scrollTop = expectedTop.current;
    };
    // Keyboard navigation still scrolls RDG internally; transfer that movement to the page.
    const onGridScroll = () => {
      const delta = grid.scrollTop - expectedTop.current;
      if (Math.abs(delta) > 1) {
        const shellOffset = shell.getBoundingClientRect().top - getScrollViewport(parent, shell).top;
        parent.scrollTop += shellOffset + grid.scrollTop;
      }
    };
    const observer = new ResizeObserver(sync);
    observer.observe(parent);
    observer.observe(shell);
    observer.observe(grid);
    const scrollTarget = getScrollEventTarget(parent);
    scrollTarget.addEventListener('scroll', sync, { passive: true });
    grid.addEventListener('scroll', onGridScroll, { passive: true });
    parent.addEventListener('log-chart-pin-change', sync);
    sync();
    return () => {
      observer.disconnect();
      scrollTarget.removeEventListener('scroll', sync);
      grid.removeEventListener('scroll', onGridScroll);
      parent.removeEventListener('log-chart-pin-change', sync);
    };
  }, [parent, contentHeight]);
  return { top, viewportHeight: height, totalHeight: contentHeight + scrollbarHeight };
}
