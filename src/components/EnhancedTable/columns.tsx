import React from 'react';
import moment from 'moment';
import type { ColumnType } from 'antd/lib/table';
import Tags from '@/components/TableTags/Tags';

/**
 * Column factories for the few near-identical column types (tags / user / date).
 * Each returns a plain antd column, so it mixes freely with hand-written columns
 * and any field can be overridden via opts. Varied columns (e.g. the primary
 * title column) stay hand-written.
 */

type UpdateByValue = string | number | null | undefined;
export type UpdateByFilterMode = 'client' | 'server' | 'none';
export const UPDATE_BY_COLUMN_META = '__fcUpdateByColumnMeta__';

export type UpdateByColumnOptions<T = any> = {
  title: React.ReactNode;
  dataIndex: ColumnType<T>['dataIndex'];
  nickname?: string;
  getValue?: (record: T) => UpdateByValue;
  filterMode?: UpdateByFilterMode;
  onFilter?: ColumnType<T>['onFilter'] | false;
} & Omit<Partial<ColumnType<T>>, 'onFilter' | 'filterMode'>;

export type UpdateByColumnType<T = any> = ColumnType<T> & {
  [UPDATE_BY_COLUMN_META]?: {
    filterMode: UpdateByFilterMode;
    getValue?: (record: T) => UpdateByValue;
    onFilter?: ColumnType<T>['onFilter'] | false;
  };
};

function getColumnValue<T = any>(record: T, dataIndex: ColumnType<T>['dataIndex']) {
  if (Array.isArray(dataIndex)) {
    return dataIndex.reduce((current: any, key) => current?.[key], record as any);
  }
  return (record as any)?.[dataIndex as any];
}

function getUpdateByFilters<T>(dataSource: T[] | undefined, readValue: (record: T) => UpdateByValue) {
  if (!dataSource?.length) return undefined;

  const valueMap = new Map<string, string | number>();
  dataSource.forEach((record) => {
    const value = readValue(record);
    if (value === undefined || value === null || value === '') return;
    valueMap.set(String(value), value);
  });

  const filters = Array.from(valueMap.entries()).map(([text, value]) => ({ text, value }));
  return filters.length ? filters : undefined;
}

export function getUpdateByColumnFilterProps<T>(column: ColumnType<T>, dataSource: readonly T[] | undefined): Pick<ColumnType<T>, 'filters' | 'onFilter'> {
  const meta = (column as UpdateByColumnType<T>)[UPDATE_BY_COLUMN_META];
  if (!meta || meta.filterMode === 'none') return {};

  const readValue = (record: T) => meta.getValue?.(record) ?? (getColumnValue(record, column.dataIndex) as UpdateByValue);
  const filters = column.filters ?? (meta.filterMode === 'client' ? getUpdateByFilters(dataSource as T[] | undefined, readValue) : undefined);
  if (!filters) return {};

  return {
    filters,
    ...(meta.onFilter === false ? {} : { onFilter: meta.onFilter ?? ((value, record) => readValue(record) === value) }),
  };
}

// Tags column (unified +N popover)
export function tagsColumn<T = any>(
  opts: {
    title: React.ReactNode;
    dataIndex: ColumnType<T>['dataIndex'];
    maxWidth?: number;
    type?: 'outline' | 'fill';
    onTagClick?: (item: any, index: number) => void;
  } & Partial<ColumnType<T>>,
): ColumnType<T> {
  const { maxWidth = 180, type = 'outline', onTagClick, ...rest } = opts;
  return {
    width: 280,
    render: (value: any) => <Tags type={type} maxWidth={maxWidth} data={value} onTagClick={onTagClick} />,
    ...rest,
  };
}

// User column: username over nickname (two lines)
export function userColumn<T = any>(
  opts: {
    title: React.ReactNode;
    dataIndex: ColumnType<T>['dataIndex'];
    nickname?: string;
  } & Partial<ColumnType<T>>,
): ColumnType<T> {
  const { nickname, ...rest } = opts;
  return {
    width: 120,
    render: (value: any, record: any) => <div>{nickname && record?.[nickname] ? <div className='text-soft'>{record[nickname]}</div> : <div>{value || '-'}</div>}</div>,
    ...rest,
  };
}

// Update-by column: user rendering plus optional local/server filter support.
export function updateByColumn<T = any>(opts: UpdateByColumnOptions<T>): UpdateByColumnType<T> {
  const { nickname, getValue, filterMode = 'client', onFilter, ...rest } = opts;
  return {
    width: 120,
    render: (value: any, record: any) => <div>{nickname && record?.[nickname] ? <div className='text-soft'>{record[nickname]}</div> : <div>{value || '-'}</div>}</div>,
    ...rest,
    [UPDATE_BY_COLUMN_META]: {
      filterMode,
      getValue,
      onFilter,
    },
  };
}

// Date column: date over time (two lines)
export function dateColumn<T = any>(
  opts: {
    title: React.ReactNode;
    dataIndex: ColumnType<T>['dataIndex'];
    unix?: boolean;
    format?: string;
  } & Partial<ColumnType<T>>,
): ColumnType<T> {
  const { unix, format = 'YYYY-MM-DD HH:mm:ss', dataIndex, ...rest } = opts;
  return {
    width: 160,
    dataIndex,
    render: (value: any) => {
      if (!value) return '-';
      const m = unix ? moment.unix(value) : moment(value);
      return <div>{m.format(format)}</div>;
    },
    sorter: (a: T, b: T) => {
      const aVal = getColumnValue(a, dataIndex);
      const bVal = getColumnValue(b, dataIndex);
      return (Number(aVal) || 0) - (Number(bVal) || 0);
    },
    ...rest,
  };
}
