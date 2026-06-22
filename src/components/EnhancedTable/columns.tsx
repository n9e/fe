import React from 'react';
import moment from 'moment';
import type { ColumnType, ColumnsType } from 'antd/lib/table';
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
    render: (value: any, record: any) => <div>{nickname && record?.[nickname] ? <div>{record[nickname]}</div> : <div>{value || '-'}</div>}</div>,
    ...rest,
  };
}

// Update-by column: user rendering plus optional local/server filter support.
export function updateByColumn<T = any>(opts: UpdateByColumnOptions<T>): UpdateByColumnType<T> {
  const { nickname, getValue, filterMode = 'client', onFilter, ...rest } = opts;
  return {
    width: 120,
    render: (value: any, record: any) => <div>{nickname && record?.[nickname] ? <div>{record[nickname]}</div> : <div>{value || '-'}</div>}</div>,
    ...rest,
    [UPDATE_BY_COLUMN_META]: {
      filterMode,
      getValue,
      onFilter,
    },
  };
}

// Date column: one line by default (date + time, no wrap); pass `multiline` to
// stack date over time on two lines. `format` accepts a single string or a
// [date, time] tuple (the tuple is joined for one line / split for two lines).
export function dateColumn<T = any>(
  opts: {
    title: React.ReactNode;
    dataIndex: ColumnType<T>['dataIndex'];
    unix?: boolean;
    multiline?: boolean;
    format?: string | [string, string];
  } & Partial<ColumnType<T>>,
): ColumnType<T> {
  const { unix, multiline, format = ['YYYY-MM-DD', 'HH:mm:ss'], ...rest } = opts;
  const parts = Array.isArray(format) ? format : [format];
  return {
    width: multiline ? 180 : 160,
    render: (value: any) => {
      if (!value) return '-';
      const m = unix ? moment.unix(value) : moment(value);
      if (multiline) {
        return (
          <div>
            {parts.map((f, i) => (
              <div key={i}>{m.format(f)}</div>
            ))}
          </div>
        );
      }
      return <div style={{ whiteSpace: 'nowrap' }}>{m.format(parts.join(' '))}</div>;
    },
    ...rest,
  };
}

type EnabledStatusFilterValue = boolean | number | string;
type EnabledStatusValue = EnabledStatusFilterValue | null | undefined;

export interface EnabledStatusColumnOptions<ValueType extends EnabledStatusValue = EnabledStatusValue> {
  title: React.ReactNode;
  dataIndex: ColumnType<any>['dataIndex'];
  enabledText: React.ReactNode;
  disabledText: React.ReactNode;
  enabledValue: EnabledStatusFilterValue;
  disabledValue: EnabledStatusFilterValue;
  getValue?: (record: any) => ValueType;
  sorter?: ColumnType<any>['sorter'];
  onFilter?: ColumnType<any>['onFilter'] | false;
}

// Enabled/disabled status column: builds the matching sorter + two-way filter.
export function getEnabledStatusColumn<ValueType extends EnabledStatusValue = EnabledStatusValue>(
  options: EnabledStatusColumnOptions<ValueType>,
): Pick<ColumnType<any>, 'title' | 'dataIndex' | 'sorter' | 'filters' | 'onFilter'> {
  const { title, dataIndex, enabledText, disabledText, enabledValue, disabledValue, getValue, sorter, onFilter } = options;
  const readValue = (record: any) => (getValue ? getValue(record) : (getColumnValue(record, dataIndex) as ValueType));
  const rank = (value: ValueType) => (value === enabledValue ? 0 : value === disabledValue ? 1 : 2);

  return {
    title,
    dataIndex,
    sorter: sorter ?? ((a, b) => rank(readValue(a)) - rank(readValue(b))),
    filters: [
      { text: enabledText, value: enabledValue },
      { text: disabledText, value: disabledValue },
    ],
    ...(onFilter === false ? {} : { onFilter: onFilter ?? ((value, record) => readValue(record) === value) }),
  };
}

// Walk the column tree and attach update-by filter props built from the data source.
export function injectColumnFilters<RecordType extends object>(
  columns: ColumnsType<RecordType> | undefined,
  dataSource: readonly RecordType[] | undefined,
): ColumnsType<RecordType> | undefined {
  if (!columns) return columns;

  return columns.map((column) => {
    if ('children' in column && column.children) {
      return {
        ...column,
        children: injectColumnFilters(column.children as ColumnsType<RecordType>, dataSource),
      };
    }

    return {
      ...column,
      ...getUpdateByColumnFilterProps(column as ColumnType<RecordType>, dataSource),
    };
  }) as ColumnsType<RecordType>;
}
