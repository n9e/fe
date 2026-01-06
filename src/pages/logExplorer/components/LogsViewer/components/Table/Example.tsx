import React, { useState, useMemo } from 'react';
import { Column, SortColumn } from 'react-data-grid';
import { Tooltip } from 'antd';
import _ from 'lodash';

import Table from './index';
import isAtBottom from './utils/isAtBottom';

type Row = {
  id: string;
  field_1: string;
  field_2: string;
  field_3: string;
  field_4: string;
  field_5: string;
};

function createFakeRowObjectData(i: number): Row {
  return {
    id: i + _.uniqueId('_'),
    field_1: `field_1 ${i}`,
    field_2: `field_2 ${i}`,
    field_3: `field_3field_3field_3field_3field_3field_3field_3field_3field_3field_3field_3field_3field_3field_3field_3field_3field_3field_3field_3 ${i}`,
    field_4: `field_4 ${i}`,
    field_5: `field_5 ${i}`,
  };
}

function createRows(count): readonly Row[] {
  const departments: Row[] = [];
  for (let i = 1; i < count; i++) {
    departments.push(createFakeRowObjectData(i));
  }
  return departments;
}

type Comparator = (a: Row, b: Row) => number;
function getComparator(sortColumn: string): Comparator {
  switch (sortColumn) {
    case 'id':
      return (a, b) => {
        return a[sortColumn].localeCompare(b[sortColumn]);
      };
    case 'field_1':
      return (a, b) => {
        return a[sortColumn] === b[sortColumn] ? 0 : a[sortColumn] ? 1 : -1;
      };
    case 'number':
      return (a, b) => {
        return a[sortColumn] - b[sortColumn];
      };
    default:
      throw new Error(`unsupported sortColumn: "${sortColumn}"`);
  }
}

function loadMoreRows(newRowsCount: number, length: number): Promise<Row[]> {
  return new Promise((resolve) => {
    const newRows: Row[] = [];

    for (let i = 0; i < newRowsCount; i++) {
      newRows[i] = createFakeRowObjectData(i + length);
    }

    setTimeout(() => resolve(newRows), 1000);
  });
}

export default function Example() {
  const columns = useMemo((): readonly Column<Row>[] => {
    return [
      {
        key: 'id',
        name: 'ID',
        width: 35,
        sortable: true,
      },
      { key: 'field_1', name: 'Field 1' },
      { key: 'field_2', name: 'Field 2' },
      {
        key: 'field_3',
        name: 'Field 3',
        formatter: ({ row }) => {
          return (
            <Tooltip placement='topLeft' title={row.field_3}>
              {row.field_3}
            </Tooltip>
          );
        },
      },
      { key: 'field_4', name: 'Field 4' },
      { key: 'field_5', name: 'Field 5' },
    ];
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState(createRows(30));
  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([
    {
      columnKey: 'id',
      direction: 'DESC',
    },
  ]);

  const sortedRows = useMemo((): readonly Row[] => {
    if (sortColumns.length === 0) return rows;

    return [...rows].sort((a, b) => {
      for (const sort of sortColumns) {
        const comparator = getComparator(sort.columnKey);
        const compResult = comparator(a, b);
        if (compResult !== 0) {
          return sort.direction === 'ASC' ? compResult : -compResult;
        }
      }
      return 0;
    });
  }, [rows, sortColumns]);

  async function handleScroll(event: React.UIEvent<HTMLDivElement>) {
    if (isLoading || !isAtBottom(event)) return;

    setIsLoading(true);

    const newRows = await loadMoreRows(50, rows.length);

    setRows([...rows, ...newRows]);
    setIsLoading(false);
  }

  return (
    <>
      <Table
        rowKeyGetter={(row) => row.id}
        columns={columns}
        rows={sortedRows}
        sortColumns={sortColumns}
        onSortColumnsChange={(newSortColumns) => {
          if (newSortColumns.length === 0) {
            setSortColumns([{ columnKey: 'id', direction: 'ASC' }]);
          } else {
            setSortColumns(newSortColumns);
          }
        }}
        onScroll={handleScroll}
      />
      {isLoading && (
        <div
          style={{
            inlineSize: '180px',
            paddingBlock: '8px',
            paddingInline: '16px',
            position: 'absolute',
            insetBlockEnd: '8px',
            insetInlineEnd: '8px',
            color: 'white',
            lineHeight: '35px',
            background: 'rgb(0 0 0 / 0.6)',
          }}
        >
          Loading more rows...
        </div>
      )}
    </>
  );
}
