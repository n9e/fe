import type { DataSourceSelectOption, DataSourceSelectSource, DataSourceSelectValue } from './types';

/** 额外补齐已选但缺失的 ID，避免 Select 复用缓存中的旧名称或静默丢弃已选项。 */
export function getDataSourceSelectOptions<T>(sources: DataSourceSelectSource<T>[], selectedValues: DataSourceSelectValue[], settled = true): DataSourceSelectOption<T>[] {
  const options: DataSourceSelectOption<T>[] = sources.map((source) => ({
    value: source.id,
    source,
    disabled: source.disabled ?? (source.status !== undefined && source.status !== 'enabled'),
    deleted: false,
  }));
  const existingIds = new Set(sources.map((source) => source.id));
  for (const value of selectedValues) {
    if (existingIds.has(value)) continue;
    existingIds.add(value);
    options.push({ value, disabled: true, deleted: settled });
  }
  return options;
}
