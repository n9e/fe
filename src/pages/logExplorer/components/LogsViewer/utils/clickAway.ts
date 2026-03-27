export const LOG_VIEWER_IGNORE_CLICK_AWAY_CLASS = 'log-explorer-ignore-click-away';
export const LOG_FIELD_SELECT_POPOVER_CLASS = 'log-field-select-popover';

export function shouldIgnoreLogViewerClickAway(target: HTMLElement | null): boolean {
  return !!(
    target &&
    typeof target.closest === 'function' &&
    (target.closest(`.${LOG_VIEWER_IGNORE_CLICK_AWAY_CLASS}`) || target.closest(`.${LOG_FIELD_SELECT_POPOVER_CLASS}`))
  );
}
