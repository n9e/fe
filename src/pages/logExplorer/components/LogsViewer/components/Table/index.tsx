import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import DataGrid, { Column, RowsChangeData, SortColumn } from 'react-data-grid';
import classNames from 'classnames';
import _ from 'lodash';
import { Empty } from 'antd';

import CellExpanderFormatter from './components/CellExpanderFormatter';
import RowDetail from './components/RowDetail';

import './style.less';

declare type Maybe<T> = T | undefined | null;

export type RowExtra<Row> = Row & {
  __type: 'MASTER' | 'DETAIL' | 'DRAWER';
  __expanded: boolean;
  __id: number | string;
  __parentId?: number | string;
};

interface Props<Row> {
  theme?: 'light' | 'dark';
  className?: string;
  rowKeyGetter: (row: Row) => number | string;
  columns: readonly Column<Row>[];
  rows: readonly Row[];
  expandable?: {
    type?: 'expand' | 'drawer';
    expandedRowRender?: (row: Row) => React.ReactNode;
    expandIcon?: (params: { expanded: boolean; onExpand: (expanded: boolean) => void; row: RowExtra<Row> }) => React.ReactNode;
    onExpandIconClick?: (row: RowExtra<Row>) => void;
  };
  sortColumns?: Maybe<readonly SortColumn[]>;
  onSortColumnsChange?: Maybe<(sortColumns: SortColumn[]) => void>;
  onScroll?: Maybe<(event: React.UIEvent<HTMLDivElement>) => void>;
  getRowHeight?: Maybe<(row: RowExtra<Row>) => number>;
  onColumnResize?: Maybe<(idx: number, width: number) => void>;
}

const ROW_HEIGHT = 35;
const ROW_EXPANDED_HEIGHT_DETAIL = 300;

export default function Table<Row>(props: Props<Row>) {
  const { theme = 'light', className, columns, rowKeyGetter, expandable, sortColumns, onSortColumnsChange, onScroll, getRowHeight, onColumnResize } = props;
  const [detailHeights, setDetailHeights] = useState<Map<number | string, number>>(new Map());
  // P1-5: 展开状态单独维护，rows 用 useMemo 派生，避免“先渲染旧 rows 再 setRows 二次渲染”
  const [expandedKeys, setExpandedKeys] = useState<Set<number | string>>(new Set());

  // 兼容 RowExtra<Row> 的 rowKeyGetter 包装
  const rowKeyGetterExtra = useCallback((r: RowExtra<Row>) => rowKeyGetter(r as unknown as Row), [rowKeyGetter]);

  // 数据变化时重置展开状态（与旧实现 useEffect setRows 时 __expanded 全部置 false 保持一致）
  const prevRowsRef = useRef(props.rows);
  useEffect(() => {
    if (prevRowsRef.current !== props.rows) {
      prevRowsRef.current = props.rows;
      setExpandedKeys(new Set());
    }
  }, [props.rows]);

  const rows = useMemo(() => {
    const masterType = expandable?.type === 'expand' ? 'MASTER' : 'DRAWER';
    const result: RowExtra<Row>[] = [];
    _.forEach(props.rows, (row) => {
      const rowKey = rowKeyGetter(row);
      const masterRow = {
        ...row,
        __id: rowKey,
        __type: masterType,
        __expanded: expandable?.type === 'expand' && expandedKeys.has(rowKey),
      } as RowExtra<Row>;
      result.push(masterRow);
      if (expandable?.type === 'expand' && expandedKeys.has(rowKey)) {
        result.push({
          ...masterRow,
          __type: 'DETAIL',
          __expanded: false,
          __id: `${rowKey}__expanded_`,
          __parentId: rowKey,
        } as RowExtra<Row>);
      }
    });
    return result;
  }, [props.rows, expandable?.type, expandedKeys, rowKeyGetter]);

  function onRowsChange(newRows: RowExtra<Row>[], { indexes }: RowsChangeData<RowExtra<Row>>) {
    const row = newRows[indexes[0]];
    if (row && row.__type === 'MASTER' && expandable?.type === 'expand') {
      const rowKey = rowKeyGetterExtra(row);
      setExpandedKeys((prev) => {
        const next = new Set(prev);
        if (row.__expanded) {
          next.add(rowKey);
        } else {
          next.delete(rowKey);
        }
        return next;
      });
    }
  }

  const handleHeightChange = useCallback((rowId: number, height: number) => {
    setDetailHeights((prev) => {
      const currentHeight = prev.get(rowId);
      // 避免重复更新相同的高度
      if (currentHeight === height) return prev;
      const newMap = new Map(prev);
      newMap.set(rowId, height);
      return newMap;
    });
  }, []);

  const ajustedColumns = useMemo((): readonly Column<RowExtra<Row>>[] => {
    const baseColumns = columns as readonly Column<RowExtra<Row>>[];

    if (expandable) {
      const extraColumn: Column<RowExtra<Row>> = {
        key: 'expanded',
        name: '',
        minWidth: 30,
        width: 30,
        resizable: false,
        frozen: true,
        colSpan(args) {
          return args.type === 'ROW' && args.row.__type === 'DETAIL' ? baseColumns.length + 1 : undefined;
        },
        formatter({ row, onRowChange }) {
          const rowKey = rowKeyGetterExtra(row);

          if (row.__type === 'DETAIL' && expandable.expandedRowRender) {
            return (
              <RowDetail
                rowId={rowKey}
                onHeightChange={handleHeightChange}
                children={expandable.expandedRowRender(_.omit(row, ['__id', '__parentId', '__type', '__expanded']) as Row)}
              />
            );
          }

          return (
            <CellExpanderFormatter
              expanded={row.__expanded}
              onCellExpand={() => {
                if (expandable.type === 'expand') {
                  onRowChange({ ...row, __expanded: !row.__expanded });
                } else if (expandable.type === 'drawer' && expandable.onExpandIconClick) {
                  expandable.onExpandIconClick(row);
                }
              }}
            />
          );
        },
      };
      return [extraColumn, ...baseColumns];
    }

    return baseColumns;
  }, [columns, handleHeightChange, rowKeyGetterExtra]);

  if (rows.length === 0) {
    return <Empty className='mt-4' image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  return (
    <DataGrid
      rowKeyGetter={(row) => row.__id}
      columns={ajustedColumns}
      rows={rows}
      rowClass={(row) => (row.__type === 'DETAIL' ? 'rdg-row-detail' : '')}
      onRowsChange={onRowsChange}
      headerRowHeight={ROW_HEIGHT}
      rowHeight={(args) => {
        if (args.type !== 'ROW') return ROW_HEIGHT;
        const rowKey = rowKeyGetterExtra(args.row);

        // 如果是DETAIL行，用展开内容的高度
        if (args.row.__type === 'DETAIL') {
          return detailHeights.get(rowKey) || ROW_EXPANDED_HEIGHT_DETAIL;
        }

        // 如果提供了自定义高度计算函数，使用它
        if (getRowHeight) {
          const customHeight = getRowHeight(args.row);
          // 如果返回数字，直接使用；否则用最小高度
          return typeof customHeight === 'number' ? customHeight : ROW_HEIGHT;
        }

        return ROW_HEIGHT;
      }}
      className={classNames(`n9e-logs-viewer-rdg w-full h-full ${className ? ` ${className}` : ''}`, {
        'rdg-light': theme === 'light',
        'rdg-dark': theme === 'dark',
      })}
      defaultColumnOptions={{
        resizable: true,
      }}
      sortColumns={sortColumns}
      onSortColumnsChange={onSortColumnsChange}
      onScroll={onScroll}
      onColumnResize={onColumnResize}
    />
  );
}
