import { RefObject, useLayoutEffect } from 'react';
import { getScrollParent, getScrollViewport } from './scrollParent';

/** Pin the chart and the query controls before it, preserving their normal DOM
 * and widths. Observe their real sizes so wrapped filters/editors remain usable.
 */
export default function usePinnedHistogram(ref: RefObject<HTMLDivElement>, pinned: boolean) {
  useLayoutEffect(() => {
    const histogram = ref.current;
    const main = histogram?.closest<HTMLElement>('[data-log-query-main]');
    if (!histogram || !main || !pinned) return;
    const backdrop = histogram.previousElementSibling;
    if (!(backdrop instanceof HTMLElement) || !backdrop.hasAttribute('data-log-pinned-backdrop')) return;
    const parent = getScrollParent(main);
    const blocks: HTMLElement[] = [];
    const collect = (container: HTMLElement): boolean => {
      let found = false;
      for (const child of Array.from(container.children)) {
        if (!(child instanceof HTMLElement)) continue;
        if (found) continue;
        if (child === histogram) {
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
    const toolbar = main.querySelector<HTMLElement>('[data-log-toolbar]');
    const hadPinnedMainClass = main.classList.contains('n9e-log-pinned-main');
    main.classList.add('n9e-log-pinned-main');
    const saved = new Map<HTMLElement, Map<string, [string, string]>>();
    const setStyle = (node: HTMLElement, name: string, value: string) => {
      if (!saved.has(node)) saved.set(node, new Map());
      const styles = saved.get(node)!;
      if (!styles.has(name)) styles.set(name, [node.style.getPropertyValue(name), node.style.getPropertyPriority(name)]);
      node.style.setProperty(name, value, 'important');
    };
    const notify = () => parent.dispatchEvent(new Event('log-chart-pin-change'));
    const update = () => {
      const viewport = getScrollViewport(parent);
      // Use the normal-flow main, not a sticky child, to keep the original
      // position stable when scrolling or resizing an already-scrolled page.
      const initialTop = Math.max(0, main.getBoundingClientRect().top + parent.scrollTop - viewport.top);
      let top = initialTop;
      if (sidebar?.classList.contains('n9e-log-sidebar-collapsed')) setStyle(sidebar, 'top', `${top}px`);
      for (const block of blocks) {
        if (!block.getClientRects().length) continue;
        setStyle(block, 'position', 'sticky');
        setStyle(block, 'top', `${top}px`);
        setStyle(block, 'z-index', '101');
        setStyle(block, 'background-color', 'var(--fc-fill-2)');
        const style = getComputedStyle(block);
        top += block.getBoundingClientRect().height + (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0);
      }
      setStyle(main, '--log-pinned-toolbar-top', `${top}px`);
      if (toolbar && toolbar.getClientRects().length && !toolbar.closest('.n9e-logs-view-modal')) {
        const style = getComputedStyle(toolbar);
        top += toolbar.getBoundingClientRect().height + (parseFloat(style.marginTop) || 0) + (parseFloat(style.marginBottom) || 0);
      }
      setStyle(main, '--log-pinned-results-top', `${top}px`);
      const backdropHeight = Math.max(0, top - initialTop);
      const parentPaddingTop = parseFloat(getComputedStyle(parent).paddingTop) || 0;
      setStyle(main, '--log-pinned-backdrop-height', `${backdropHeight}px`);
      setStyle(main, '--log-pinned-backdrop-top', `${initialTop}px`);
      // Two native sticky layers: the header stays at its original offset;
      // the cap can slide up to the scrollport edge. Neither uses a negative
      // leading margin, which can constrain a sticky box below that edge.
      setStyle(main, '--log-pinned-cap-top', `${-parentPaddingTop}px`);
      setStyle(main, '--log-pinned-cap-height', `${initialTop + parentPaddingTop}px`);
      main.dataset.logPinnedHeight = String(top);
      notify();
    };
    // In collapsed mode the expand button shares the first query row.
    const sidebar = main.parentElement?.parentElement?.querySelector<HTMLElement>(':scope > .n9e-log-sidebar');
    if (sidebar) {
      setStyle(sidebar, 'position', 'sticky');
      setStyle(sidebar, 'z-index', '102');
    }
    const observer = new ResizeObserver(update);
    blocks.forEach((block) => observer.observe(block));
    if (toolbar) observer.observe(toolbar);
    observer.observe(parent);
    observer.observe(main);
    window.addEventListener('resize', update);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
      for (const [node, styles] of saved) {
        for (const [name, [value, priority]] of styles) {
          if (value) node.style.setProperty(name, value, priority);
          else node.style.removeProperty(name);
        }
      }
      if (!hadPinnedMainClass) main.classList.remove('n9e-log-pinned-main');
      delete main.dataset.logPinnedHeight;
      notify();
    };
  }, [ref, pinned]);
}
