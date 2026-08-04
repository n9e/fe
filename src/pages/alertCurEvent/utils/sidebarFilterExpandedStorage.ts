export type AlertCurEventSidebarFilterKey = 'prod' | 'severity' | 'datasource';

const STORAGE_PREFIX = 'alert-cur-events-sidebar-filter-expanded';
const LEGACY_DATASOURCE_STORAGE_KEY = 'alert-cur-events-datasource-filter-expanded';

function getLocalStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function getAlertCurEventSidebarFilterExpandedStorageKey(filterKey: AlertCurEventSidebarFilterKey) {
  return `${STORAGE_PREFIX}:${filterKey}`;
}

export function readAlertCurEventSidebarFilterExpanded(filterKey: AlertCurEventSidebarFilterKey, defaultValue: boolean): boolean {
  try {
    const storage = getLocalStorage();
    const value = storage?.getItem(getAlertCurEventSidebarFilterExpandedStorageKey(filterKey));
    if (value !== undefined && value !== null) return value === '1';

    // 保留已上线的数据源筛选面板展开偏好。
    if (filterKey === 'datasource') {
      const legacyValue = storage?.getItem(LEGACY_DATASOURCE_STORAGE_KEY);
      if (legacyValue !== undefined && legacyValue !== null) return legacyValue === '1';
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
}

export function writeAlertCurEventSidebarFilterExpanded(filterKey: AlertCurEventSidebarFilterKey, expanded: boolean) {
  try {
    getLocalStorage()?.setItem(getAlertCurEventSidebarFilterExpandedStorageKey(filterKey), expanded ? '1' : '0');
  } catch {
    // Ignore storage failures, for example in private mode.
  }
}
