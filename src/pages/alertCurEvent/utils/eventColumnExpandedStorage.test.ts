import {
  ALERT_CUR_EVENT_TAGS_EXPANDED_TABLE_KEY,
  HISTORY_EVENT_TAGS_EXPANDED_TABLE_KEY,
  getAlertEventTagsExpandedStorageKey,
  readAlertEventTagsExpanded,
  writeAlertEventTagsExpanded,
} from './eventColumnExpandedStorage';
import { readFileSync } from 'node:fs';
import path from 'node:path';

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

describe('alert event tag expansion storage', () => {
  beforeEach(() => {
    mockLocalStorage();
  });

  afterEach(() => {
    delete (globalThis as any).localStorage;
  });

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

describe('alert event pages using tag expansion', () => {
  const root = path.resolve(__dirname, '../../../..');

  it.each([
    ['src/pages/alertCurEvent/pages/List/index.tsx', 'ALERT_CUR_EVENT_TAGS_EXPANDED_TABLE_KEY'],
    ['src/pages/historyEvents/ListNG/index.tsx', 'HISTORY_EVENT_TAGS_EXPANDED_TABLE_KEY'],
  ])('%s persists tag expansion toggles with its own table key', (file, tableKey) => {
    const source = readFileSync(path.join(root, file), 'utf8');

    expect(source).toContain('readAlertEventTagsExpanded');
    expect(source).toContain('writeAlertEventTagsExpanded');
    expect(source).toContain(tableKey);
    expect(source).toContain(`readAlertEventTagsExpanded(${tableKey})`);
    expect(source).toContain(`writeAlertEventTagsExpanded(${tableKey}, next)`);
    expect(source).not.toContain('useState(readAlertEventTagsExpanded)');
    expect(source).not.toContain('writeAlertEventTagsExpanded(next)');
  });
});
