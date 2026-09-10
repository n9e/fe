import type { ReactNode } from 'react';
import type { DataSourcePickerSource, DataSourcePickerType, DataSourcePickerValue } from '../types';

export type DataSourceSelectValue = DataSourcePickerValue;

export interface DataSourceSelectSource<T = unknown> extends DataSourcePickerSource<T> {
  typeLabel?: string;
  disabledReason?: string;
  /** 仅在下拉选项名称旁展示，例如推荐标记。 */
  extra?: ReactNode;
}

interface DataSourceSelectBaseProps<T> {
  sources: DataSourceSelectSource<T>[];
  /** 用于补充实例图标和右侧类型名称，不在组件内筛选实例。 */
  types?: DataSourcePickerType[];
  id?: string;
  /** 展示在选择框上方，与刷新和数据接入操作位于同一行。 */
  label?: ReactNode;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  refreshing?: boolean;
  error?: ReactNode;
  allowClear?: boolean;
  onRefresh?: () => void | Promise<void>;
  onAdd?: () => void | Promise<void>;
}

interface SingleDataSourceSelectProps<T> extends DataSourceSelectBaseProps<T> {
  mode?: 'single';
  value?: DataSourceSelectValue;
  onChange?: (value: DataSourceSelectValue | undefined, source: DataSourceSelectSource<T> | undefined) => void;
}

interface MultipleDataSourceSelectProps<T> extends DataSourceSelectBaseProps<T> {
  mode: 'multiple';
  value?: DataSourceSelectValue[];
  /** 默认不显示；全选范围为传入 sources 中全部可用项，不受搜索影响。 */
  showSelectAll?: boolean;
  /** 已删除项保留在 value 中；selectedSources 只包含当前列表内能找到的实例。 */
  onChange?: (value: DataSourceSelectValue[], selectedSources: DataSourceSelectSource<T>[]) => void;
}

export type DataSourceSelectProps<T = unknown> = SingleDataSourceSelectProps<T> | MultipleDataSourceSelectProps<T>;

export interface DataSourceSelectOption<T = unknown> {
  value: DataSourceSelectValue;
  source?: DataSourceSelectSource<T>;
  disabled: boolean;
  deleted: boolean;
}
