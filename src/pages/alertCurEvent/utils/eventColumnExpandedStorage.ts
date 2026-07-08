export const ALERT_EVENT_TAGS_EXPANDED_STORAGE_PREFIX = 'alert-event-tags-expanded';
export const ALERT_CUR_EVENT_TAGS_EXPANDED_TABLE_KEY = 'alert-cur-events';
export const HISTORY_EVENT_TAGS_EXPANDED_TABLE_KEY = 'history-events';

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
