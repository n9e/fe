export const ALERT_EVENT_TAGS_EXPANDED_STORAGE_KEY = 'alert-event-tags-expanded';

function getLocalStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function readAlertEventTagsExpanded(defaultValue = false): boolean {
  try {
    const value = getLocalStorage()?.getItem(ALERT_EVENT_TAGS_EXPANDED_STORAGE_KEY);
    if (value === undefined || value === null) return defaultValue;
    return value === '1';
  } catch {
    return defaultValue;
  }
}

export function writeAlertEventTagsExpanded(expanded: boolean) {
  try {
    getLocalStorage()?.setItem(ALERT_EVENT_TAGS_EXPANDED_STORAGE_KEY, expanded ? '1' : '0');
  } catch {
    // Ignore storage failures, for example in private mode.
  }
}
