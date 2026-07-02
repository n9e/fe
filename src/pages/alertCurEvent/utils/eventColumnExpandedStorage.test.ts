import {
  ALERT_EVENT_TAGS_EXPANDED_STORAGE_KEY,
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

  it('defaults collapsed and persists expanded state', () => {
    expect(readAlertEventTagsExpanded()).toBe(false);

    writeAlertEventTagsExpanded(true);

    expect(globalThis.localStorage.setItem).toHaveBeenCalledWith(ALERT_EVENT_TAGS_EXPANDED_STORAGE_KEY, '1');
    expect(readAlertEventTagsExpanded()).toBe(true);

    writeAlertEventTagsExpanded(false);

    expect(globalThis.localStorage.setItem).toHaveBeenCalledWith(ALERT_EVENT_TAGS_EXPANDED_STORAGE_KEY, '0');
    expect(readAlertEventTagsExpanded()).toBe(false);
  });
});

describe('alert event pages using tag expansion', () => {
  const root = path.resolve(__dirname, '../../../..');

  it.each(['src/pages/alertCurEvent/pages/List/index.tsx', 'src/pages/historyEvents/ListNG/index.tsx'])('%s persists tag expansion toggles', (file) => {
    const source = readFileSync(path.join(root, file), 'utf8');

    expect(source).toContain('readAlertEventTagsExpanded');
    expect(source).toContain('writeAlertEventTagsExpanded');
  });
});
