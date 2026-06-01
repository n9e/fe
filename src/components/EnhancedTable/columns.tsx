import React from 'react';
import moment from 'moment';
import type { ColumnType } from 'antd/lib/table';
import Tags from '@/components/TableTags/Tags';

/**
 * 列工厂助手 —— 只是「返回一个标准 antd column 对象」的函数，不接管 antd Table。
 * - 与手写 column 在同一个 columns 数组里随意混用；
 * - 任何字段（width/align/sorter/render…）都能通过参数覆盖默认；
 * - 只覆盖「几乎每张表都一样」的 date / user / tags，标题等差异大的列继续手写。
 */

// ---- 标签列：统一用 Tags（+N Popover） ----
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
    ...rest, // 调用方可覆盖 width / render / 任意列属性
  };
}

// ---- 用户列：两行 用户名 / 昵称 ----
export function userColumn<T = any>(
  opts: {
    title: React.ReactNode;
    dataIndex: ColumnType<T>['dataIndex'];
    nickname?: string; // 第二行字段名（无则只显示一行）
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

// ---- 时间列：两行 日期 / 时间 ----
export function dateColumn<T = any>(
  opts: {
    title: React.ReactNode;
    dataIndex: ColumnType<T>['dataIndex'];
    unix?: boolean; // 值为 unix 秒
    format?: [string, string]; // [日期格式, 时间格式]
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
