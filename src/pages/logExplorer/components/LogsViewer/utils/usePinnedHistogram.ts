import { RefObject, useLayoutEffect } from 'react';
import { getScrollParent, getScrollViewport, getScrollEventTarget } from './scrollParent';

/** Pin the chart and the query controls before it, preserving their normal DOM
 * and widths. Observe their real sizes so wrapped filters/editors remain usable.
 */
export default function usePinnedHistogram(ref: RefObject<HTMLDivElement>, pinned: boolean) {
  useLayoutEffect(() => {
    const histogram = ref.current;
    const main = histogram?.closest<HTMLElement>('[data-log-query-main]');
    if (!histogram || !main || !pinned) return;
    const parent = getScrollParent(main);
    const blocks: HTMLElement[] = [];
    const results: HTMLElement[] = [];
    const collect = (container: HTMLElement): boolean => {
      let found = false;
      for (const child of Array.from(container.children)) {
        if (!(child instanceof HTMLElement)) continue;
        if (found) {
          results.push(child);
        } else if (child === histogram) {
          blocks.push(child);
          found = true;
        } else if (child.contains(histogram)) {
          found = collect(child);
        } else if (child.getClientRects().length && getComputedStyle(child).position !== 'absolute') {
          blocks.push(child);
        }
      }
      return found;
    };
    collect(main);
    const saved = new Map<HTMLElement, Map<string, [string, string]>>();
    const setStyle = (node: HTMLElement, name: string, value: string) => {
      if (!saved.has(node)) saved.set(node, new Map());
      const styles = saved.get(node)!;
      if (!styles.has(name)) styles.set(name, [node.style.getPropertyValue(name), node.style.getPropertyPriority(name)]);
      node.style.setProperty(name, value, 'important');
    };
    const notify = () => parent.dispatchEvent(new Event('log-chart-pin-change'));
    const clipResults = () => {
      const bottom = getScrollViewport(parent, main).top;
      for (const node of results) {
        const original = saved.get(node)?.get('clip-path')?.[0] || '';
        // Fullscreen uses a separate viewport and must not inherit page clipping.
        const cut = node.closest('.n9e-logs-view-modal') ? 0 : Math.max(0, bottom - node.getBoundingClientRect().top);
        setStyle(node, 'clip-path', cut > 0 ? `inset(${cut}px 0 0)` : original);
      }
    };
    const update = () => {
      const viewport = getScrollViewport(parent);
      // Use the normal-flow main, not a sticky child, to keep the original
      // position stable when scrolling or resizing an already-scrolled page.
      let top = Math.max(0, main.getBoundingClientRect().top + parent.scrollTop - viewport.top);
      if (sidebar?.classList.contains('n9e-log-sidebar-collapsed')) setStyle(sidebar, 'top', `${top}px`);
      for (const block of blocks) {
        if (!block.getClientRects().length) continue;
        setStyle(block, 'position', 'sticky');
        setStyle(block, 'top', `${top}px`);
        setStyle(block, 'z-index', '4');
        setStyle(block, 'background-color', 'var(--fc-fill-2)');
        const style = getComputedStyle(block);
        top += block.getBoundingClientRect().height + (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0);
      }
      main.dataset.logPinnedHeight = String(top);
      clipResults();
      notify();
    };
    // In collapsed mode the expand button shares the first query row.
    const sidebar = main.parentElement?.parentElement?.querySelector<HTMLElement>(':scope > .n9e-log-sidebar');
    if (sidebar) {
      setStyle(sidebar, 'position', 'sticky');
      setStyle(sidebar, 'z-index', '5');
    }
    const observer = new ResizeObserver(update);
    blocks.forEach((block) => observer.observe(block));
    results.forEach((node) => observer.observe(node));
    const scrollTarget = getScrollEventTarget(parent);
    scrollTarget.addEventListener('scroll', clipResults, { passive: true });
    observer.observe(parent);
    observer.observe(main);
    window.addEventListener('resize', update);
    update();
    return () => {
      observer.disconnect();
      scrollTarget.removeEventListener('scroll', clipResults);
      window.removeEventListener('resize', update);
      for (const [node, styles] of saved) {
        for (const [name, [value, priority]] of styles) {
          if (value) node.style.setProperty(name, value, priority);
          else node.style.removeProperty(name);
        }
      }
      delete main.dataset.logPinnedHeight;
      notify();
    };
  }, [ref, pinned]);
}
