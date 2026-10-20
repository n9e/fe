import { RefObject, useLayoutEffect } from 'react';
import { getScrollParent } from './scrollParent';

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
    const collect = (container: HTMLElement): boolean => {
      for (const child of Array.from(container.children)) {
        if (!(child instanceof HTMLElement)) continue;
        if (child === histogram) {
          blocks.push(child);
          return true;
        }
        if (child.contains(histogram)) return collect(child);
        if (child.getClientRects().length && getComputedStyle(child).position !== 'absolute') blocks.push(child);
      }
      return false;
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
    const update = () => {
      let top = 0;
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
      notify();
    };
    // In collapsed mode the expand button shares the first query row.
    const sidebar = main.parentElement?.parentElement?.querySelector<HTMLElement>(':scope > .n9e-log-sidebar');
    if (sidebar) setStyle(sidebar, 'position', 'sticky');
    const observer = new ResizeObserver(update);
    blocks.forEach((block) => observer.observe(block));
    update();
    return () => {
      observer.disconnect();
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
