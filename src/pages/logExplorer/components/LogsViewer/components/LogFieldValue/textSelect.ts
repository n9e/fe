export interface TextSelectionPopoverPosition {
  left: number;
  top: number;
}

export interface TextSelectionPopoverResult {
  selectedFragment: string;
  anchorRect: TextSelectionPopoverPosition;
}

interface RectLike {
  left: number;
  top: number;
  bottom: number;
}

interface HostLike {
  getBoundingClientRect(): Pick<RectLike, 'left' | 'top'>;
}

interface RootLike {
  contains(node: Node | null): boolean;
}

interface RangeLike {
  collapsed: boolean;
  commonAncestorContainer: Node;
  getBoundingClientRect(): Pick<RectLike, 'left' | 'bottom'>;
}

interface SelectionLike {
  rangeCount: number;
  anchorNode: Node | null;
  focusNode: Node | null;
  toString(): string;
  getRangeAt(index: number): RangeLike;
}

interface GetTextSelectionPopoverResultParams {
  host: HostLike | null;
  root: RootLike | null;
  selection: SelectionLike | null;
  isNodeInside: (root: RootLike, node: Node | null) => boolean;
  selectionTextWithinRoot?: string;
  onDebug?: (payload: Record<string, unknown>) => void;
}

export function isNodeInside(root: HTMLElement, node: Node | null): boolean {
  if (!node) return false;
  const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);
  if (!el) return false;
  return root.contains(el);
}

export function getSelectionRangeWithinRoot(selection: Selection, root: HTMLElement): Range | undefined {
  if (!selection.rangeCount) return;

  const selectedRange = selection.getRangeAt(0).cloneRange();
  if (!selectedRange.intersectsNode(root)) return;

  const rootRange = root.ownerDocument.createRange();
  rootRange.selectNodeContents(root);

  if (selectedRange.compareBoundaryPoints(Range.START_TO_START, rootRange) < 0) {
    selectedRange.setStart(rootRange.startContainer, rootRange.startOffset);
  }
  if (selectedRange.compareBoundaryPoints(Range.END_TO_END, rootRange) > 0) {
    selectedRange.setEnd(rootRange.endContainer, rootRange.endOffset);
  }

  return selectedRange.collapsed ? undefined : selectedRange;
}

export function getSelectionTextWithinRoot(selection: Selection, root: HTMLElement): string {
  return getSelectionRangeWithinRoot(selection, root)?.toString() ?? '';
}

/** Map a range clipped to the field into offsets in its unformatted value. */
export function getFieldSelectionOffsets(root: HTMLElement, rangeWithinRoot: Range, fieldValue: string, selectionText: string): { from: number; to: number } | undefined {
  if (root.textContent !== fieldValue) return;

  const textWithinRoot = rangeWithinRoot.toString();
  const fragment = textWithinRoot.trim();
  if (!fragment || selectionText.trim() !== fragment) return;

  const beforeSelection = root.ownerDocument.createRange();
  beforeSelection.selectNodeContents(root);
  beforeSelection.setEnd(rangeWithinRoot.startContainer, rangeWithinRoot.startOffset);
  const leadingWhitespace = textWithinRoot.length - textWithinRoot.trimStart().length;
  const from = beforeSelection.toString().length + leadingWhitespace;
  return { from, to: from + fragment.length };
}

export function isTextSelectDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem('n9e:text-select-debug') === '1';
}

export function getNodeDebugName(node: Node | null): string {
  if (!node) return 'null';
  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    return `#text(${text})`;
  }
  if (node instanceof Element) {
    const cls = node.className ? `.${String(node.className).replace(/\s+/g, '.')}` : '';
    return `${node.tagName.toLowerCase()}${cls}`;
  }
  return `${node.nodeName}`;
}

export function getTextSelectionPopoverResult(params: GetTextSelectionPopoverResultParams): TextSelectionPopoverResult | null {
  const { host, root, selection, isNodeInside, selectionTextWithinRoot, onDebug } = params;

  if (!host || !root || !selection || selection.rangeCount === 0) {
    onDebug?.({ reason: 'missing-host-root-or-selection', hasHost: !!host, hasRoot: !!root, hasSelection: !!selection, rangeCount: selection?.rangeCount ?? 0 });
    return null;
  }

  const range = selection.getRangeAt(0);
  if (range.collapsed) {
    onDebug?.({ reason: 'collapsed-range' });
    return null;
  }

  const text = selection.toString();
  const trimmedText = text.trim();
  if (!trimmedText) {
    onDebug?.({ reason: 'empty-selection-text', text });
    return null;
  }

  const anchorInside = isNodeInside(root, selection.anchorNode);
  const focusInside = isNodeInside(root, selection.focusNode);
  const commonAncestorInside = root.contains(range.commonAncestorContainer);

  // 首选严格同字段：anchor/focus/commonAncestor 都在 root 内。
  const strictInside = anchorInside && focusInside && commonAncestorInside;

  // 兼容常见边界：选区端点落在字段外层包裹/margin 区域，
  // 或从字段外开始划词但选区内包含当前字段文本。
  const trimmedTextWithinRoot = selectionTextWithinRoot?.trim() || '';
  const fallbackInside = !!trimmedTextWithinRoot && trimmedText.includes(trimmedTextWithinRoot);

  if (!strictInside && !fallbackInside) {
    onDebug?.({
      reason: 'outside-root-and-not-fallback',
      strictInside,
      fallbackInside,
      anchorInside,
      focusInside,
      commonAncestorInside,
      trimmedText,
      trimmedTextWithinRoot,
    });
    return null;
  }

  const rect = range.getBoundingClientRect();
  const hostRect = host.getBoundingClientRect();

  const result = {
    selectedFragment: trimmedTextWithinRoot || text,
    anchorRect: {
      left: rect.left - hostRect.left,
      top: rect.bottom - hostRect.top,
    },
  };

  onDebug?.({
    reason: 'accepted',
    strictInside,
    fallbackInside,
    anchorInside,
    focusInside,
    commonAncestorInside,
    trimmedText,
    trimmedTextWithinRoot,
    anchorRect: result.anchorRect,
  });

  return result;
}
