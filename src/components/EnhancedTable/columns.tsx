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
    render: (value: any, record: any) => (
      <div>
        <div>{value || '-'}</div>
        {nickname && record?.[nickname] && <div className='text-soft'>{record[nickname]}</div>}
      </div>
    ),
    ...rest,
  };
}

// Date column: date over time (two lines)
export function dateColumn<T = any>(
  opts: {
    title: React.ReactNode;
    dataIndex: ColumnType<T>['dataIndex'];
    unix?: boolean;
    format?: [string, string];
  } & Partial<ColumnType<T>>,
): ColumnType<T> {
  const { unix, format = ['YYYY-MM-DD', 'HH:mm:ss'], ...rest } = opts;
  return {
    width: 180,
    render: (value: any) => {
      if (!value) return '-';
      const m = unix ? moment.unix(value) : moment(value);
      return (
        <div>
          <div>{m.format(format[0])}</div>
          <div>{m.format(format[1])}</div>
        </div>
      );
    },
    ...rest,
  };
}
