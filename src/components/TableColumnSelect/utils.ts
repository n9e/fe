export interface ColumnOption {
  label: string;
  value: string;
  order?: number;
}

export interface DefaultColumnConfig {
  name: string;
  i18nKey?: string;
  visible: boolean;
}

/**
 * 从 localStorage 读取已选中的列名列表（string[] 格式）。
 * 兼容旧格式 {name, visible}[] 并自动迁移到新格式。
 *
 * @param defaultColumnsConfigs - 默认列配置数组，包含 name、visible 等信息
 * @param localStorageKey - localStorage 存储键名
 * @returns 可见列名列表（按显示顺序排列）
 */
export function getDefaultColumnsConfigs(defaultColumnsConfigs: DefaultColumnConfig[], localStorageKey: string): string[] {
  const saved = localStorage.getItem(localStorageKey);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        if (parsed.length === 0 || typeof parsed[0] === 'string') {
          return parsed as string[];
        }
        // Old format: {name, visible}[] -> migrate to string[]
        const migrated = parsed.filter((c: any) => c.visible).map((c: any) => c.name);
        localStorage.setItem(localStorageKey, JSON.stringify(migrated));
        return migrated;
      }
    } catch (e) {
      console.error(e);
    }
  }
  return defaultColumnsConfigs.filter((c) => c.visible).map((c) => c.name);
}

/**
 * 将已选中的列名列表保存到 localStorage。
 *
 * @param visibleColumns - 可见列名列表（按显示顺序排列）
 * @param localStorageKey - localStorage 存储键名
 */
export function setDefaultColumnsConfigs(visibleColumns: string[], localStorageKey: string): void {
  localStorage.setItem(localStorageKey, JSON.stringify(visibleColumns));
}

/**
 * 将默认列配置数组（包含 i18nKey）转换为 TableColumnSelect 所需的 ColumnOption[]。
 * 每次渲染直接调用即可，无需 useMemo 包裹。
 *
 * @param defaultColumnsConfigs - 默认列配置数组
 * @param t - i18n 翻译函数，用于解析 i18nKey
 * @returns ColumnOption[] 供 TableColumnSelect 的 options prop 使用
 */
export function buildColumnOptions(defaultColumnsConfigs: DefaultColumnConfig[], t: (key: string) => string): ColumnOption[] {
  return defaultColumnsConfigs.map((c) => ({
    label: t(c.i18nKey || c.name),
    value: c.name,
  }));
}
