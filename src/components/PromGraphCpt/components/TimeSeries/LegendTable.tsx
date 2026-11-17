import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Popover, Space, Table } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { ColumnProps } from 'antd/lib/table';
import type { SorterResult } from 'antd/lib/table/interface';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { isChineseLanguage } from '@/utils/n9eSiteDoc';

import type { LegendItem as DataItem } from './data';
import NameWithTooltip from './NameWithTooltip';

const ROW_HEIGHT = 24;
const OVERSCAN_COUNT = 8;

interface Props {
  data: DataItem[];
  maxHeight: number;
  legendColumns?: string[];
  onRowClick: (record: DataItem) => void;
  seriesFilterText?: string;
  onSeriesFilterTextChange?: (value: string) => void;
  filteredText?: string;
}

function LegendTable(props: Props) {
  const { t, i18n } = useTranslation('dashboard');
  const legendLng = isChineseLanguage(i18n.language) ? i18n.language : 'en_US';
  const { data: tableData, legendColumns, onRowClick } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [sortState, setSortState] = useState<{ column?: string; dir?: 'asc' | 'desc' }>({});
  const [filterVisible, setFilterVisible] = useState(false);
  const [filterDraft, setFilterDraft] = useState(props.seriesFilterText || '');
  const filteredData = useMemo(() => {
    const search = props.seriesFilterText?.toLowerCase();
    return search ? tableData.filter((item) => item.name.toLowerCase().includes(search)) : tableData;
  }, [tableData, props.seriesFilterText]);
  const confirmFilter = () => {
    props.onSeriesFilterTextChange?.(filterDraft);
    setFilterVisible(false);
  };

  const columns: ColumnProps<DataItem>[] = useMemo(() => {
    const cols: ColumnProps<DataItem>[] = [
      {
        title: props.onSeriesFilterTextChange ? (
          <Popover
            trigger='click'
            placement='topLeft'
            visible={filterVisible}
            onVisibleChange={(visible) => {
              setFilterVisible(visible);
              setFilterDraft(props.seriesFilterText || '');
            }}
            content={
              <Space>
                <Input
                  size='small'
                  allowClear
                  value={filterDraft}
                  onChange={(event) => setFilterDraft(event.target.value)}
                  onPressEnter={confirmFilter}
                  placeholder={t('panel.options.legend.seriesFilter')}
                  style={{ width: 160 }}
                />
                <Button type='primary' size='small' onClick={confirmFilter}>
                  {t('common:btn.ok')}
                </Button>
              </Space>
            }
            getPopupContainer={() => document.body}
            destroyTooltipOnHide
          >
            <Space className='cursor-pointer'>
              <span>
                {t('panel.options.legend.series', { lng: legendLng })} ({filteredData.length})
              </span>
              <SearchOutlined title={t('panel.options.legend.seriesFilter')} style={{ color: props.seriesFilterText ? 'var(--fc-primary-color)' : undefined }} />
              {props.seriesFilterText && props.filteredText && <span className='text-soft'>({props.filteredText})</span>}
            </Space>
          </Popover>
        ) : (
          `${t('panel.options.legend.series', { lng: legendLng })} (${tableData.length})`
        ),
        dataIndex: 'name',
        render: (text: string, record: DataItem) => {
          return (
            <div className='w-full flex items-center gap-2 whitespace-nowrap'>
              <div className='w-[14px] h-[4px] rounded-[10px] inline-block flex-shrink-0' style={{ backgroundColor: record.color }} />
              <NameWithTooltip record={record}>
                <div className='whitespace-nowrap bg-transparent border-0 text-inherit padding-0 text-ellipsis overflow-hidden select-text'>
                  <span>{text}</span>
                </div>
              </NameWithTooltip>
            </div>
          );
        },
      },
    ];
    _.forEach(legendColumns, (column) => {
      cols.push({
        title: t(`panel.options.legend.${column}`, { lng: legendLng }),
        dataIndex: column,
        fixed: 'right',
        width: 112,
        align: 'right',
        sorter: (a, b) => Number(a[column].stat) - Number(b[column].stat),
        sortOrder: sortState.column === column ? (sortState.dir === 'desc' ? 'descend' : 'ascend') : null,
        render: (text) => {
          return text.text;
        },
      });
    });
    return cols;
  }, [
    tableData.length,
    filteredData.length,
    legendColumns,
    sortState.column,
    sortState.dir,
    t,
    legendLng,
    props.seriesFilterText,
    props.onSeriesFilterTextChange,
    props.filteredText,
    filterVisible,
    filterDraft,
  ]);

  const sortedData = useMemo(() => {
    if (!sortState.column || !sortState.dir) {
      return filteredData;
    }
    return _.orderBy(filteredData, [(item) => item[sortState.column!]?.stat], [sortState.dir]);
  }, [filteredData, sortState.column, sortState.dir]);

  const resetScroll = useCallback(() => {
    setScrollTop(0);
    containerRef.current?.querySelector<HTMLElement>('.ant-table-body')?.scrollTo({ top: 0 });
  }, []);

  useEffect(resetScroll, [props.seriesFilterText, resetScroll]);

  const visibleRange = useMemo(() => {
    if (!props.maxHeight) {
      return {
        start: 0,
        end: sortedData.length,
      };
    }
    const visibleCount = Math.ceil(props.maxHeight / ROW_HEIGHT) + OVERSCAN_COUNT * 2;
    const start = Math.min(Math.max(Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN_COUNT, 0), Math.max(sortedData.length - visibleCount, 0));
    const end = Math.min(start + visibleCount, sortedData.length);
    return { start, end };
  }, [props.maxHeight, scrollTop, sortedData.length]);

  const visibleData = useMemo(() => sortedData.slice(visibleRange.start, visibleRange.end), [sortedData, visibleRange.start, visibleRange.end]);
  const topPadding = visibleRange.start * ROW_HEIGHT;
  const bottomPadding = Math.max(sortedData.length - visibleRange.end, 0) * ROW_HEIGHT;

  const VirtualBodyWrapper = useCallback(
    (wrapperProps: React.HTMLAttributes<HTMLTableSectionElement>) => {
      const { children, ...restProps } = wrapperProps;

      return (
        <tbody {...restProps}>
          {topPadding > 0 && (
            <tr className='prom-timeseries-legend-table-spacer'>
              <td colSpan={columns.length} style={{ height: topPadding }} />
            </tr>
          )}
          {children}
          {bottomPadding > 0 && (
            <tr className='prom-timeseries-legend-table-spacer'>
              <td colSpan={columns.length} style={{ height: bottomPadding }} />
            </tr>
          )}
        </tbody>
      );
    },
    [bottomPadding, columns.length, topPadding],
  );

  return (
    <div
      ref={containerRef}
      className='min-w-0 prom-timeseries-legend-table-scroll'
      onScrollCapture={(e) => {
        if (e.target instanceof HTMLElement && e.target.classList.contains('ant-table-body')) {
          setScrollTop(e.target.scrollTop);
        }
      }}
    >
      <Table
        className='prom-timeseries-legend-table'
        size='small'
        pagination={false}
        rowKey='id'
        columns={columns}
        scroll={{ x: 'max-content', y: props.maxHeight }}
        dataSource={visibleData}
        components={{
          body: {
            wrapper: VirtualBodyWrapper,
          },
        }}
        onChange={(_pagination, _filters, sorter: SorterResult<DataItem> | SorterResult<DataItem>[]) => {
          if (Array.isArray(sorter)) {
            return;
          }
          resetScroll();
          setSortState({
            column: sorter?.order && typeof sorter.field === 'string' ? sorter.field : undefined,
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

export default React.memo(LegendTable);
