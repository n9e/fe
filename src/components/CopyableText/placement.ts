import type { CSSProperties } from 'react';

export type CopyPlacement = 'auto' | 'inside';

const BUTTON_SIZE = 24;
const GAP = 4;

/** Read only the active value, never observe or scan the whole page. */
function lastTextRect(content: HTMLElement) {
  const bounds = content.getBoundingClientRect();
  const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
  const range = document.createRange();
  let last = bounds;
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (!node.textContent?.trim()) continue;
    range.selectNodeContents(node);
    for (const rect of Array.from(range.getClientRects())) {
      if (rect.width && rect.top < bounds.bottom && rect.bottom > bounds.top && rect.left < bounds.right) last = rect;
    }
  }
  // Range ends before the ellipsis painted by the browser. Use the clipped
  // element's edge so an inward copy control covers the ellipsis as well.
  const clipped = [content, ...Array.from(content.querySelectorAll('a, button'))].find((element) => element.scrollWidth > element.clientWidth);
  return {
    left: bounds.left,
    right: clipped ? Math.min(clipped.getBoundingClientRect().right, bounds.right) : Math.min(last.right, bounds.right),
    top: Math.max(last.top, bounds.top),
    bottom: Math.min(last.bottom, bounds.bottom),
  };
}

/** Composite translucent tag/row fills over their actual ancestors. */
function surfaceColor(element: Element | null): string | undefined {
  let alpha = 0;
  const channels = [0, 0, 0];
  for (let current = element; current && alpha < 0.999; current = current.parentElement) {
    const color = getComputedStyle(current).backgroundColor;
    const values = color.match(/[\d.]+/g)?.map(Number);
    if (!values || values.length < 3) continue;
    const layerAlpha = values[3] ?? 1;
    const weight = layerAlpha * (1 - alpha);
    channels.forEach((_, index) => (channels[index] += values[index] * weight));
    alpha += weight;
  }
  return alpha >= 0.999 ? `rgb(${channels.map(Math.round).join(', ')})` : undefined;
}

function siblingLimit(element: HTMLElement, top: number, bottom: number, start: number) {
  let limit = document.documentElement.clientWidth;
  for (let current: Node | null = element; current?.parentElement; current = current.parentElement) {
    const parent = current.parentElement;
    const style = getComputedStyle(parent);
    const bounds = parent.getBoundingClientRect();
    // A copy control must stay inside its cell and any clipping/scroll container.
    if (parent.tagName === 'TD' || parent.tagName === 'TH' || /(hidden|clip|auto|scroll)/.test(style.overflowX)) {
      limit = Math.min(limit, bounds.right - parseFloat(style.borderRightWidth || '0'));
    }
    for (let sibling = current.nextSibling; sibling; sibling = sibling.nextSibling) {
      if (sibling.nodeType === Node.TEXT_NODE && !sibling.textContent?.trim()) continue;
      const range = document.createRange();
      range.selectNode(sibling);
      for (const rect of Array.from(range.getClientRects())) {
        if (rect.width && rect.bottom > top && rect.top < bottom && rect.left >= start - 1) limit = Math.min(limit, rect.left);
      }
    }
    if (parent.tagName === 'TD' || parent.tagName === 'TH' || parent === document.body) break;
  }
  return limit;
}

export function measureCopyPlacement(root: HTMLElement, content: HTMLElement, placement: CopyPlacement) {
  const box = root.getBoundingClientRect();
  const tail = lastTextRect(content);
  const height = Math.min(BUTTON_SIZE, Math.max(16, box.height));
  const top = Math.max(box.top, Math.min(tail.top + (tail.bottom - tail.top - height) / 2, box.bottom - height));
  const limit = siblingLimit(root, top, top + height, tail.right);
  // Prefer covering only the value. Short/empty values may cover the current tag's key,
  // rather than shrinking the icon or taking space from the following item.
  const tag = root.closest('.fc-copyable-tag')?.parentElement || root.closest('.ant-tag');
  const padding = tag ? parseFloat(getComputedStyle(tag).paddingRight || '0') : 0;
  const tagRight = tag?.getBoundingClientRect().right;
  // Outward controls sit beyond a capsule's existing padding, without squaring off its corner.
  const outsideAnchor = tagRight && tagRight - tail.right <= padding + 2 ? tagRight : tail.right;
  const outside = placement === 'auto' && outsideAnchor + GAP + BUTTON_SIZE <= limit;
  const insetEnd = Math.min(tail.right + padding, limit);
  // A one-character capsule can be narrower than 24px. Keep the 14px icon intact,
  // while containing the hit area/background within that capsule.
  const width = !outside && tag ? Math.min(BUTTON_SIZE, tag.clientWidth) : BUTTON_SIZE;
  const left = outside ? outsideAnchor + GAP : insetEnd - width;
  const underButton = outside ? document.elementsFromPoint(left + width / 2, top + height / 2).find((element) => !root.contains(element)) || root.parentElement : content;
  return {
    side: outside ? 'outside' : 'inside',
    style: {
      '--fc-copy-left': `${left - box.left}px`,
      '--fc-copy-top': `${top - box.top}px`,
      '--fc-copy-width': `${width}px`,
      '--fc-copy-height': `${height}px`,
      '--fc-copy-background': surfaceColor(underButton),
    } as CSSProperties,
  };
}
