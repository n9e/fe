export const ALERT_EVENT_TAGS_EXPANDED_STORAGE_PREFIX = 'alert-event-tags-expanded';
export const ALERT_CUR_EVENT_TAGS_EXPANDED_TABLE_KEY = 'alert-cur-events';
export const HISTORY_EVENT_TAGS_EXPANDED_TABLE_KEY = 'history-events';

export type AlertEventTagsDisplayMode = 'all' | 'compact' | 'off';

export function getAlertEventTagsExpandedStorageKey(tableKey: string) {
  return `${ALERT_EVENT_TAGS_EXPANDED_STORAGE_PREFIX}:${tableKey}`;
}

function getLocalStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function readAlertEventTagsExpanded(tableKey: string, defaultValue = false): boolean {
  try {
    const value = getLocalStorage()?.getItem(getAlertEventTagsExpandedStorageKey(tableKey));
    if (value === undefined || value === null) return defaultValue;
    return value === '1';
  } catch {
    return defaultValue;
  }
}

export function writeAlertEventTagsExpanded(tableKey: string, expanded: boolean) {
  try {
    getLocalStorage()?.setItem(getAlertEventTagsExpandedStorageKey(tableKey), expanded ? '1' : '0');
  } catch {
    // Ignore storage failures, for example in private mode.
  }
}

export function readAlertEventTagsDisplayMode(tableKey: string, defaultValue: AlertEventTagsDisplayMode = 'compact'): AlertEventTagsDisplayMode {
  try {
    const value = getLocalStorage()?.getItem(getAlertEventTagsExpandedStorageKey(tableKey));
    if (value === undefined || value === null) return defaultValue;
    if (value === 'all' || value === 'compact' || value === 'off') return value;

    // 兼容旧的展开/收起状态：1 为展开全部，0 为精简展示。
    if (value === '1') return 'all';
    if (value === '0') return 'compact';
    return defaultValue;
  } catch {
    return defaultValue;
  }
}

export function writeAlertEventTagsDisplayMode(tableKey: string, mode: AlertEventTagsDisplayMode) {
  try {
    getLocalStorage()?.setItem(getAlertEventTagsExpandedStorageKey(tableKey), mode);
  } catch {
    // Ignore storage failures, for example in private mode.
  }
}
