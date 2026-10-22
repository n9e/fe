/** The page (or fullscreen results panel) owns vertical scrolling. */
export function getScrollParent(element: HTMLElement): HTMLElement {
  let parent = element.parentElement;
  while (parent) {
    if (/(auto|scroll)/.test(getComputedStyle(parent).overflowY)) return parent;
    parent = parent.parentElement;
  }
  return (document.scrollingElement as HTMLElement) || document.documentElement;
}

/** Locate shared results and their actual page or fullscreen scroll owner. */
export function getExternalLogScroll(element: Element | null) {
  const results = element?.closest<HTMLElement>('[data-log-results]');
  if (!results) return null;
  return { results, parent: getScrollParent(results) };
}

/** Compare visible results against the owner viewport; return undefined for legacy callers. */
export function isExternalLogAtBottom(element: Element | null): boolean | undefined {
  const external = getExternalLogScroll(element);
  if (!external) return undefined;
  const { results, parent } = external;
  if (!results.getClientRects().length) return false;
  const viewport = getScrollViewport(parent);
  return results.getBoundingClientRect().bottom <= viewport.top + viewport.height + 1;
}

/** Sticky grids use the content viewport, excluding the page's padding. */
export function getPinnedLogHeight(element: HTMLElement, parent: HTMLElement) {
  const main = element.closest<HTMLElement>('[data-log-query-main]');
  // Fullscreen has a separate viewport, outside the pinned page header.
  return main && parent.contains(main) ? Number(main.dataset.logPinnedHeight) || 0 : 0;
}

/** Resolve the visible viewport after accounting for padding and pinned headers. */
export function getScrollViewport(parent: HTMLElement, element?: HTMLElement) {
  const pinned = element ? getPinnedLogHeight(element, parent) : 0;
  if (parent === document.scrollingElement) return { top: pinned, height: Math.max(0, window.innerHeight - pinned) };
  const style = getComputedStyle(parent);
  const paddingTop = parseFloat(style.paddingTop) || 0;
  const paddingBottom = parseFloat(style.paddingBottom) || 0;
  return {
    top: parent.getBoundingClientRect().top + parent.clientTop + paddingTop + pinned,
    height: Math.max(0, parent.clientHeight - paddingTop - paddingBottom - pinned),
  };
}

/** Use window events for document scrolling and element events for nested owners. */
export function getScrollEventTarget(parent: HTMLElement): HTMLElement | Window {
  return parent === document.scrollingElement ? window : parent;
}
