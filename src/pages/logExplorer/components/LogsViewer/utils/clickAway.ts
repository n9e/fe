export const LOG_VIEWER_IGNORE_CLICK_AWAY_CLASS = 'log-explorer-ignore-click-away';
export const LOG_FIELD_SELECT_POPOVER_CLASS = 'log-field-select-popover';

function isIgnoredNode(node: EventTarget): boolean {
  const classList = (node as Element).classList;
  return !!classList && (classList.contains(LOG_VIEWER_IGNORE_CLICK_AWAY_CLASS) || classList.contains(LOG_FIELD_SELECT_POPOVER_CLASS));
}

// 用派发时的 composedPath 判断：点击可能触发重渲染，把 target 从 DOM 摘掉，之后 closest 就找不到祖先了
export function shouldIgnoreLogViewerClickAway(event: Event | undefined): boolean {
  return !!event && event.composedPath().some(isIgnoredNode);
}
