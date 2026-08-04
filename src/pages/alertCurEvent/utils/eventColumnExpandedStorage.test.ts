import {
  ALERT_CUR_EVENT_TAGS_EXPANDED_TABLE_KEY,
  HISTORY_EVENT_TAGS_EXPANDED_TABLE_KEY,
  getAlertEventTagsExpandedStorageKey,
  readAlertEventTagsDisplayMode,
  readAlertEventTagsExpanded,
  writeAlertEventTagsDisplayMode,
  writeAlertEventTagsExpanded,
} from './eventColumnExpandedStorage';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  getAlertCurEventSidebarFilterExpandedStorageKey,
  readAlertCurEventSidebarFilterExpanded,
  writeAlertCurEventSidebarFilterExpanded,
} from './sidebarFilterExpandedStorage';

function mockLocalStorage() {
  const values = new Map<string, string>();

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: jest.fn((key: string) => values.get(key) ?? null),
      setItem: jest.fn((key: string, value: string) => {
        values.set(key, value);
      }),
    },
  });
}

beforeEach(() => {
  mockLocalStorage();
});

afterEach(() => {
  delete (globalThis as any).localStorage;
});

describe('alert event tag expansion storage', () => {

  it('defaults collapsed and persists expanded state per table', () => {
    expect(readAlertEventTagsExpanded(ALERT_CUR_EVENT_TAGS_EXPANDED_TABLE_KEY)).toBe(false);
    expect(readAlertEventTagsExpanded(HISTORY_EVENT_TAGS_EXPANDED_TABLE_KEY)).toBe(false);

    writeAlertEventTagsExpanded(ALERT_CUR_EVENT_TAGS_EXPANDED_TABLE_KEY, true);

    expect(globalThis.localStorage.setItem).toHaveBeenCalledWith(getAlertEventTagsExpandedStorageKey(ALERT_CUR_EVENT_TAGS_EXPANDED_TABLE_KEY), '1');
    expect(readAlertEventTagsExpanded(ALERT_CUR_EVENT_TAGS_EXPANDED_TABLE_KEY)).toBe(true);
    expect(readAlertEventTagsExpanded(HISTORY_EVENT_TAGS_EXPANDED_TABLE_KEY)).toBe(false);

    writeAlertEventTagsExpanded(HISTORY_EVENT_TAGS_EXPANDED_TABLE_KEY, true);

    expect(globalThis.localStorage.setItem).toHaveBeenCalledWith(getAlertEventTagsExpandedStorageKey(HISTORY_EVENT_TAGS_EXPANDED_TABLE_KEY), '1');
    expect(readAlertEventTagsExpanded(ALERT_CUR_EVENT_TAGS_EXPANDED_TABLE_KEY)).toBe(true);
    expect(readAlertEventTagsExpanded(HISTORY_EVENT_TAGS_EXPANDED_TABLE_KEY)).toBe(true);

    writeAlertEventTagsExpanded(ALERT_CUR_EVENT_TAGS_EXPANDED_TABLE_KEY, false);

    expect(globalThis.localStorage.setItem).toHaveBeenCalledWith(getAlertEventTagsExpandedStorageKey(ALERT_CUR_EVENT_TAGS_EXPANDED_TABLE_KEY), '0');
    expect(readAlertEventTagsExpanded(ALERT_CUR_EVENT_TAGS_EXPANDED_TABLE_KEY)).toBe(false);
    expect(readAlertEventTagsExpanded(HISTORY_EVENT_TAGS_EXPANDED_TABLE_KEY)).toBe(true);
  });
});

describe('active alert event tag display storage', () => {
  it('defaults to compact and persists all three display modes', () => {
    const key = getAlertEventTagsExpandedStorageKey(ALERT_CUR_EVENT_TAGS_EXPANDED_TABLE_KEY);

    expect(readAlertEventTagsDisplayMode(ALERT_CUR_EVENT_TAGS_EXPANDED_TABLE_KEY)).toBe('compact');

    for (const mode of ['all', 'compact', 'off'] as const) {
      writeAlertEventTagsDisplayMode(ALERT_CUR_EVENT_TAGS_EXPANDED_TABLE_KEY, mode);
      expect(globalThis.localStorage.setItem).toHaveBeenLastCalledWith(key, mode);
      expect(readAlertEventTagsDisplayMode(ALERT_CUR_EVENT_TAGS_EXPANDED_TABLE_KEY)).toBe(mode);
    }
  });

  it('maps legacy expansion values to the matching display modes', () => {
    const key = getAlertEventTagsExpandedStorageKey(ALERT_CUR_EVENT_TAGS_EXPANDED_TABLE_KEY);

    globalThis.localStorage.setItem(key, '1');
    expect(readAlertEventTagsDisplayMode(ALERT_CUR_EVENT_TAGS_EXPANDED_TABLE_KEY)).toBe('all');

    globalThis.localStorage.setItem(key, '0');
    expect(readAlertEventTagsDisplayMode(ALERT_CUR_EVENT_TAGS_EXPANDED_TABLE_KEY)).toBe('compact');
  });
});

describe('active alert event sidebar filter expansion storage', () => {
  it.each([
    ['prod', true],
    ['severity', true],
    ['datasource', false],
  ] as const)('%s uses its default state and persists changes', (filterKey, defaultValue) => {
    const key = getAlertCurEventSidebarFilterExpandedStorageKey(filterKey);

    expect(readAlertCurEventSidebarFilterExpanded(filterKey, defaultValue)).toBe(defaultValue);

    writeAlertCurEventSidebarFilterExpanded(filterKey, !defaultValue);
    expect(globalThis.localStorage.setItem).toHaveBeenLastCalledWith(key, defaultValue ? '0' : '1');
    expect(readAlertCurEventSidebarFilterExpanded(filterKey, defaultValue)).toBe(!defaultValue);
  });
});

describe('alert event pages tag display controls', () => {
  const root = path.resolve(__dirname, '../../../..');

  it('uses persisted controls for the three-state tag display and sidebar filters', () => {
    const source = readFileSync(path.join(root, 'src/pages/alertCurEvent/pages/List/index.tsx'), 'utf8');

    expect(source).toContain('readAlertEventTagsDisplayMode(ALERT_CUR_EVENT_TAGS_EXPANDED_TABLE_KEY)');
    expect(source).toContain('writeAlertEventTagsDisplayMode(ALERT_CUR_EVENT_TAGS_EXPANDED_TABLE_KEY, next)');
    expect(source).toContain("{ label: t('tag_display_all'), value: 'all' }");
    expect(source).toContain("{ label: t('tag_display_compact'), value: 'compact' }");
    expect(source).toContain("{ label: t('tag_display_off'), value: 'off' }");
    expect(source).toContain("readAlertCurEventSidebarFilterExpanded('prod', true)");
    expect(source).toContain("readAlertCurEventSidebarFilterExpanded('severity', true)");
    expect(source).toContain("readAlertCurEventSidebarFilterExpanded('datasource', false)");
    expect(source).toContain("writeAlertCurEventSidebarFilterExpanded('prod', expanded)");
    expect(source).toContain("writeAlertCurEventSidebarFilterExpanded('severity', expanded)");
    expect(source).toContain("writeAlertCurEventSidebarFilterExpanded('datasource', expanded)");
    expect(source).toContain("activeKey={datasourceFilterExpanded ? ['datasource'] : []}");
  });

  it('renders all, compact, and hidden tag modes without fixed table columns', () => {
    const source = readFileSync(path.join(root, 'src/pages/alertCurEvent/pages/List/AlertTable.tsx'), 'utf8');

    expect(source).toContain("tagDisplayMode === 'all'");
    expect(source).toContain("tagDisplayMode === 'compact'");
    expect(source).not.toContain('fixed:');
  });

  it('keeps the history alert page on the legacy expansion controls', () => {
    const source = readFileSync(path.join(root, 'src/pages/historyEvents/ListNG/index.tsx'), 'utf8');

    expect(source).toContain('readAlertEventTagsExpanded');
    expect(source).toContain('writeAlertEventTagsExpanded');
    expect(source).toContain('HISTORY_EVENT_TAGS_EXPANDED_TABLE_KEY');
    expect(source).toContain('readAlertEventTagsExpanded(HISTORY_EVENT_TAGS_EXPANDED_TABLE_KEY)');
    expect(source).toContain('writeAlertEventTagsExpanded(HISTORY_EVENT_TAGS_EXPANDED_TABLE_KEY, next)');
    expect(source).not.toContain('useState(readAlertEventTagsExpanded)');
    expect(source).not.toContain('writeAlertEventTagsExpanded(next)');
  });
});
