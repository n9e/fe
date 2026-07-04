import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Table } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import { useSize } from 'ahooks';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { IPanel } from '../../../../../types';
import { DataItem } from '../../utils/getLegendData';
import NameWithTooltip from '../NameWithTooltip';

import Link from './Link';

const ROW_HEIGHT = 24;
const HEADER_HEIGHT = 24;
const OVERSCAN_COUNT = 8;
const MOCK_ROWS_KEY = '__legend_mock_rows';

interface Props {
  panel: IPanel;
  data: DataItem[];
  legendColumns?: string[];
  legendSortBy?: string;
  legendSortDir?: string;
  onRowClick: (record: DataItem) => void;
}

function getMockRowsCount() {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return 0;
  }
  const raw = window.localStorage.getItem(MOCK_ROWS_KEY);
  const count = Number(raw);
  if (!Number.isFinite(count) || count <= 0) {
    return 0;
  }
  return Math.min(Math.floor(count), 50000);
}

function mockLegendData(data: DataItem[], count: number) {
  if (!count || data.length === 0 || data.length >= count) {
    return data;
  }
  return _.times(count, (idx) => {
    const source = data[idx % data.length];
    return {
      ...source,
      id: `${source.id}__mock_${idx}`,
      name: `${source.name} #${idx + 1}`,
    };
  });
}

export default function LegendTable(props: Props) {
  const { t } = useTranslation('dashboard');
  const { panel, data, legendColumns, legendSortBy, legendSortDir, onRowClick } = props;
  const options = panel.options || {};
  const detailName = options.legend?.detailName;
  const detailUrl = options.legend?.detailUrl;
  const tableEleRef = React.useRef<HTMLDivElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const containerSize = useSize(containerRef);
  const bodyHeight = Math.max((containerSize?.height || 0) - HEADER_HEIGHT, 0);
  const [scrollTop, setScrollTop] = useState(0);
  const [sortState, setSortState] = useState<{ column?: string; dir?: 'asc' | 'desc' }>({
    column: legendSortBy,
    dir: legendSortBy ? (legendSortDir === 'desc' ? 'desc' : 'asc') : undefined,
  });
  const tableData = useMemo(() => mockLegendData(data, getMockRowsCount()), [data]);

  const columns: ColumnProps<DataItem>[] = useMemo(() => {
    const cols: ColumnProps<DataItem>[] = [
      {
        title: `Series (${tableData.length})`,
        dataIndex: 'name',
        width: '100%',
        render: (text, record: any) => {
          return (
            <div className='w-full flex items-center gap-2 whitespace-nowrap'>
              <div className='w-[14px] h-[4px] rounded-[10px] inline-block flex-shrink-0' style={{ backgroundColor: record.color }} />
              <NameWithTooltip record={record}>
                <div className='whitespace-nowrap bg-transparent border-0 text-inherit padding-0 max-w-[600px] text-ellipsis overflow-hidden select-text'>
                  {record.offset && record.offset !== 'current' ? <span style={{ paddingRight: 4 }}>offset {record.offset}</span> : ''}
                  <span>{text}</span>
                </div>
              </NameWithTooltip>
              <Link data={record} name={detailName} url={detailUrl} />
            </div>
          );
        },
      },
    ];
    _.forEach(legendColumns, (column) => {
      cols.push({
        title: t(`panel.options.legend.${column}`, {
          lng: 'en_US', // fixed to en_US, optimize column width
        }),
        dataIndex: column,
        sorter: (a, b) => a[column].stat - b[column].stat,
        sortOrder: sortState.column === column ? (sortState.dir === 'desc' ? 'descend' : 'ascend') : null,
        render: (text) => {
          return text.text;
        },
      });
    });
    return cols;
  }, [tableData.length, legendColumns, sortState.column, sortState.dir, t, detailName, detailUrl]);

  useEffect(() => {
    setSortState({
      column: legendSortBy,
      dir: legendSortBy ? (legendSortDir === 'desc' ? 'desc' : 'asc') : undefined,
    });
  }, [legendSortBy, legendSortDir]);

  const sortedData = useMemo(() => {
    if (!sortState.column || !sortState.dir) {
      return tableData;
    }
    return _.orderBy(tableData, [(item) => item[sortState.column!]?.stat], [sortState.dir]);
  }, [tableData, sortState.column, sortState.dir]);

  const visibleRange = useMemo(() => {
    if (!bodyHeight) {
      return {
        start: 0,
        end: sortedData.length,
      };
    }
    const bodyScrollTop = Math.max(scrollTop - HEADER_HEIGHT, 0);
    const start = Math.max(Math.floor(bodyScrollTop / ROW_HEIGHT) - OVERSCAN_COUNT, 0);
    const visibleCount = Math.ceil(bodyHeight / ROW_HEIGHT) + OVERSCAN_COUNT * 2;
    const end = Math.min(start + visibleCount, sortedData.length);
    return { start, end };
  }, [bodyHeight, scrollTop, sortedData.length]);

  const visibleData = useMemo(() => sortedData.slice(visibleRange.start, visibleRange.end), [sortedData, visibleRange.start, visibleRange.end]);
  const topPadding = visibleRange.start * ROW_HEIGHT;
  const bottomPadding = Math.max(sortedData.length - visibleRange.end, 0) * ROW_HEIGHT;

  const VirtualBodyWrapper = useCallback(
    (wrapperProps: any) => {
      const { children, ...restProps } = wrapperProps;

      return (
        <tbody {...restProps}>
          {topPadding > 0 && (
            <tr className='renderer-timeseries-ng-legend-table-spacer'>
              <td colSpan={columns.length} style={{ height: topPadding }} />
            </tr>
          )}
          {children}
          {bottomPadding > 0 && (
            <tr className='renderer-timeseries-ng-legend-table-spacer'>
              <td colSpan={columns.length} style={{ height: bottomPadding }} />
            </tr>
          )}
        </tbody>
      );
    },
    [bottomPadding, columns.length, topPadding],
  );

  useEffect(() => {
    if (tableEleRef.current) {
      /**
       * 解决在 windows 系统里首次渲染会出现一个空白的滚动条
       * 设置 minWidth 本身是没有意义的，只是为了让浏览器重新计算一下宽度
       */
      tableEleRef.current.style.minWidth = 'unset';
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className='min-w-0 h-full overflow-auto renderer-timeseries-ng-legend-table-scroll'
      onScroll={(e) => {
        setScrollTop(e.currentTarget.scrollTop);
      }}
    >
      <Table
        className='renderer-timeseries-ng-legend-table'
        size='small'
        pagination={false}
        rowKey='id'
        columns={columns}
        dataSource={visibleData}
        components={{
          body: {
            wrapper: VirtualBodyWrapper,
          },
        }}
        onChange={(pagination, filters, sorter: any) => {
          if (_.isArray(sorter)) {
            return;
          }
          setScrollTop(0);
          containerRef.current?.scrollTo({ top: 0 });
          setSortState({
            column: sorter?.order ? sorter?.field : undefined,
            dir: sorter?.order === 'descend' ? 'desc' : sorter?.order === 'ascend' ? 'asc' : undefined,
          });
        }}
        rowClassName={(record) => {
          return !record.show ? 'cursor-pointer text-soft' : 'cursor-pointer';
        }}
        onRow={(record) => {
          return {
            onClick: () => {
              onRowClick(record);
            },
          };
        }}
      />
    </div>
  );
}
