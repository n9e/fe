import React, { useMemo, useState, useCallback, useEffect } from 'react';
import DataGrid, { Column, RowsChangeData, SortColumn } from 'react-data-grid';
import classNames from 'classnames';
import _ from 'lodash';

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
  const [rows, setRows] = useState<RowExtra<Row>[]>([]);

  // 兼容 RowExtra<Row> 的 rowKeyGetter 包装
  const rowKeyGetterExtra = useCallback((r: RowExtra<Row>) => rowKeyGetter(r as unknown as Row), [rowKeyGetter]);

  useEffect(() => {
    setRows(
      _.map(props.rows, (row) => {
        return {
          ...row,
          __id: rowKeyGetter(row),
          __type: expandable?.type === 'expand' ? 'MASTER' : 'DRAWER',
          __expanded: false,
        };
      }),
    );
  }, [props.rows]);

  function onRowsChange(rows: RowExtra<Row>[], { indexes }: RowsChangeData<RowExtra<Row>>) {
    const row = rows[indexes[0]];
    if (row.__type === 'MASTER') {
      if (!row.__expanded) {
        rows.splice(indexes[0] + 1, 1);
      } else {
        const rowKey = rowKeyGetterExtra(row);
        rows.splice(indexes[0] + 1, 0, {
          ...row,
          __type: 'DETAIL',
          __expanded: false,
          __id: rowKey + _.uniqueId('__expanded_'),
          __parentId: rowKey,
        } as RowExtra<Row>);
      }
      setRows(rows);
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
      enableVirtualization={false}
      defaultColumnOptions={{
        resizable: true,
      }}
      sortColumns={sortColumns}
      onSortColumnsChange={onSortColumnsChange}
      renderers={{}}
      onScroll={onScroll}
      onColumnResize={onColumnResize}
    />
  );
}
