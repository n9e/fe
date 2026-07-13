import { getDefaultColumnsConfigs, setDefaultColumnsConfigs, buildColumnOptions, DefaultColumnConfig, ColumnOption } from './utils';

// ---------- localStorage mock ----------
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

// ---------- fixtures ----------
const defaultConfigs: DefaultColumnConfig[] = [
  { name: 'name', i18nKey: 'table.name', visible: true },
  { name: 'severities', i18nKey: 'table.severity', visible: false },
  { name: 'update_at', i18nKey: 'table.update_at', visible: true },
  { name: 'disabled', i18nKey: 'table.disabled', visible: true },
];

const t = (key: string) => {
  const map: Record<string, string> = {
    'table.name': '名称',
    'table.severity': '级别',
    'table.update_at': '更新时间',
    'table.disabled': '启停状态',
  };
  return map[key] ?? key;
};

// ===================== buildColumnOptions =====================
describe('buildColumnOptions', () => {
  it('transforms config to ColumnOption[] with resolved i18n labels', () => {
    const result = buildColumnOptions(defaultConfigs, t);
    expect(result).toEqual([
      { label: '名称', value: 'name' },
      { label: '级别', value: 'severities' },
      { label: '更新时间', value: 'update_at' },
      { label: '启停状态', value: 'disabled' },
    ]);
  });

  it('falls back to name when i18nKey is missing', () => {
    const configs: DefaultColumnConfig[] = [
      { name: 'custom_field', visible: true },
      { name: 'another_field', visible: false },
    ];
    const result = buildColumnOptions(configs, t);
    expect(result).toEqual([
      { label: 'custom_field', value: 'custom_field' },
      { label: 'another_field', value: 'another_field' },
    ]);
  });

  it('preserves the input order', () => {
    const reversed = [...defaultConfigs].reverse();
    const result = buildColumnOptions(reversed, t);
    expect(result.map((o) => o.value)).toEqual(['disabled', 'update_at', 'severities', 'name']);
  });

  it('handles empty config array', () => {
    expect(buildColumnOptions([], t)).toEqual([]);
  });

  it('passes the key as-is to t when i18nKey contains namespace prefix', () => {
    const configs: DefaultColumnConfig[] = [{ name: 'update_by', i18nKey: 'common:table.username', visible: true }];
    const customT = jest.fn((key: string) => key);
    const result = buildColumnOptions(configs, customT);
    expect(customT).toHaveBeenCalledWith('common:table.username');
    expect(result[0].label).toBe('common:table.username');
  });
});

// ===================== setDefaultColumnsConfigs =====================
describe('setDefaultColumnsConfigs', () => {
  it('saves string[] to localStorage', () => {
    setDefaultColumnsConfigs(['name', 'update_at', 'disabled'], 'test_key');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test_key', JSON.stringify(['name', 'update_at', 'disabled']));
  });

  it('saves empty array', () => {
    setDefaultColumnsConfigs([], 'test_key');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test_key', JSON.stringify([]));
  });
});

// ===================== getDefaultColumnsConfigs =====================
describe('getDefaultColumnsConfigs', () => {
  const KEY = 'test_columns_config';

  it('returns default visible columns when nothing is saved', () => {
    const result = getDefaultColumnsConfigs(defaultConfigs, KEY);
    // defaultConfigs 中 visible: true 的有 name/update_at/disabled
    expect(result).toEqual(['name', 'update_at', 'disabled']);
  });

  it('returns saved string[] when new format is stored', () => {
    localStorageMock.setItem(KEY, JSON.stringify(['disabled', 'name']));
    const result = getDefaultColumnsConfigs(defaultConfigs, KEY);
    expect(result).toEqual(['disabled', 'name']);
  });

  it('returns empty string[] when empty array is saved', () => {
    localStorageMock.setItem(KEY, JSON.stringify([]));
    const result = getDefaultColumnsConfigs(defaultConfigs, KEY);
    expect(result).toEqual([]);
  });

  it('migrates old format {name, visible}[] to string[] and updates localStorage', () => {
    const oldFormat = [
      { name: 'name', visible: true },
      { name: 'severities', visible: false },
      { name: 'update_at', visible: true },
      { name: 'disabled', visible: false },
    ];
    localStorageMock.setItem(KEY, JSON.stringify(oldFormat));

    const result = getDefaultColumnsConfigs(defaultConfigs, KEY);

    // 只返回 visible: true 的列
    expect(result).toEqual(['name', 'update_at']);

    // localStorage 已被迁移为新格式
    expect(localStorageMock.setItem).toHaveBeenCalledWith(KEY, JSON.stringify(['name', 'update_at']));
  });

  it('handles old format with all columns visible', () => {
    const oldFormat = [
      { name: 'name', visible: true },
      { name: 'severities', visible: true },
      { name: 'update_at', visible: true },
    ];
    localStorageMock.setItem(KEY, JSON.stringify(oldFormat));

    const result = getDefaultColumnsConfigs(defaultConfigs, KEY);
    expect(result).toEqual(['name', 'severities', 'update_at']);
  });

  it('handles old format with no columns visible', () => {
    const oldFormat = [
      { name: 'name', visible: false },
      { name: 'severities', visible: false },
    ];
    localStorageMock.setItem(KEY, JSON.stringify(oldFormat));

    const result = getDefaultColumnsConfigs(defaultConfigs, KEY);
    expect(result).toEqual([]);
  });

  it('falls back to defaults when saved JSON is invalid', () => {
    localStorageMock.setItem(KEY, '{corrupt json');
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = getDefaultColumnsConfigs(defaultConfigs, KEY);
    expect(result).toEqual(['name', 'update_at', 'disabled']);

    consoleSpy.mockRestore();
  });

  it('falls back to defaults when saved value is not an array', () => {
    localStorageMock.setItem(KEY, JSON.stringify('not_an_array'));
    const result = getDefaultColumnsConfigs(defaultConfigs, KEY);
    expect(result).toEqual(['name', 'update_at', 'disabled']);
  });

  it('preserves the order from saved data (new format)', () => {
    localStorageMock.setItem(KEY, JSON.stringify(['disabled', 'name', 'update_at']));
    const result = getDefaultColumnsConfigs(defaultConfigs, KEY);
    expect(result).toEqual(['disabled', 'name', 'update_at']);
  });

  it('migrates old format preserving the original array order', () => {
    const oldFormat = [
      { name: 'disabled', visible: true },
      { name: 'name', visible: true },
      { name: 'severities', visible: true },
    ];
    localStorageMock.setItem(KEY, JSON.stringify(oldFormat));
    const result = getDefaultColumnsConfigs(defaultConfigs, KEY);
    expect(result).toEqual(['disabled', 'name', 'severities']);
  });
});
