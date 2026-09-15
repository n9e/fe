import type { ReactNode } from 'react';

export type DataSourcePickerValue = string | number;

export interface DataSourcePickerType {
  value: string;
  label: ReactNode;
  icon?: ReactNode;
}

export interface DataSourcePickerSource<T = unknown> {
  id: DataSourcePickerValue;
  name: string;
  type: string;
  status?: string;
  icon?: ReactNode;
  disabled?: boolean;
  raw: T;
}

export interface DataSourceTypeListProps {
  types: DataSourcePickerType[];
  value?: string;
  disabled?: boolean;
  className?: string;
  typeFilter?: (type: DataSourcePickerType) => boolean;
  onChange: (type: string) => void;
}

export interface DataSourceListProps<T = unknown> {
  /** 展示调用方提供的实例，不依赖类型列表，也不在内部按类型过滤。 */
  sources: DataSourcePickerSource<T>[];
  value?: DataSourcePickerValue;
  fallbackIcon?: ReactNode;
  loading?: boolean;
  refreshing?: boolean;
  error?: boolean | ReactNode;
  disabled?: boolean;
  className?: string;
  emptyDescription?: ReactNode;
  noMatchDescription?: ReactNode;
  onChange: (source?: DataSourcePickerSource<T>) => void;
  onSearch?: (query: string) => void | Promise<void>;
  onRefresh?: () => void | Promise<void>;
  onAccess?: () => void;
}
