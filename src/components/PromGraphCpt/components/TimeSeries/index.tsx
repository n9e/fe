import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useSize } from 'ahooks';
import { hexPalette } from '@/pages/dashboard/config';
import type { IRawTimeRange } from '@/components/TimeRangePicker';
import type { IStandardOptions } from '@/pages/dashboard/types';
import Chart from './Chart';
import LegendTable from './LegendTable';
import { getPlotData, getLegendData, legendColumns } from './data';
import type { LegendItem, PromSeries } from './data';
import './style.less';

export interface TimeSeriesOptions {
  custom: { lineInterpolation?: string; fillOpacity?: number; stack?: string; drawStyle?: string };
  options: {
    legend: { displayMode: string; columns?: string[] };
    tooltip: { mode: string; sort: string };
    standardOptions?: IStandardOptions;
  };
}

interface Props {
  id: string;
  values: TimeSeriesOptions;
  series: PromSeries[];
  time: IRawTimeRange;
  themeMode?: 'dark';
  legendTableMaxHeight?: number;
  seriesFilterText?: string;
  onSeriesFilterTextChange?: (value: string) => void;
  filteredText?: string;
  onZoomRangeChange?: (times?: Date[]) => void;
  zoomed?: boolean;
}

/** Prom 即时查询专用图表。参考仪表盘新版实现，独立管理布局、交互和图例。 */
export default function TimeSeries(props: Props) {
  const graphRef = useRef<HTMLDivElement>(null);
  const graphSize = useSize(graphRef);
  const [selection, setSelection] = useState<{ source: PromSeries[]; id: string }>();
  const { frames, baseSeries } = useMemo(() => getPlotData(props.series), [props.series]);
  const selectedId = selection?.source === props.series ? selection.id : undefined;
  const series = useMemo(() => baseSeries.map((item) => ({ ...item, show: !selectedId || selectedId === item.n9e_internal.id })), [baseSeries, selectedId]);
  const { legend, tooltip, standardOptions } = props.values.options;
  const columnsKey = JSON.stringify(legend.columns || []);
  const columns = useMemo(() => {
    const requestedColumns = JSON.parse(columnsKey) as string[];
    return (requestedColumns.length ? requestedColumns : ['last']).filter((column) => legendColumns.includes(column as (typeof legendColumns)[number]));
  }, [columnsKey]);
  const { unit, decimals, dateFormat } = standardOptions || {};
  const legendData = useMemo(() => getLegendData(frames, series, hexPalette, { unit, decimals, dateFormat }), [frames, series, unit, decimals, dateFormat]);
  const onLegendRowClick = useCallback((record: LegendItem) => setSelection({ source: props.series, id: selectedId === record.id ? '' : record.id }), [props.series, selectedId]);

  return (
    <div className='prom-timeseries-container'>
      <div ref={graphRef} className='prom-timeseries-graph-container'>
        {graphSize && graphSize.width > 0 && (
          <Chart
            id={props.id}
            width={graphSize.width}
            height={graphSize.height}
            frames={frames}
            series={series}
            colors={hexPalette}
            custom={props.values.custom}
            tooltip={tooltip}
            standardOptions={standardOptions}
            time={props.time}
            darkMode={props.themeMode === 'dark'}
            onZoomRangeChange={props.onZoomRangeChange}
            zoomed={props.zoomed}
          />
        )}
      </div>
      {legend.displayMode !== 'hidden' && (
        <div className='prom-timeseries-legend-container'>
          <LegendTable
            maxHeight={Math.max(props.legendTableMaxHeight ?? 200, 48)}
            data={legendData}
            legendColumns={columns}
            seriesFilterText={props.seriesFilterText}
            onSeriesFilterTextChange={props.onSeriesFilterTextChange}
            filteredText={props.filteredText}
            onRowClick={onLegendRowClick}
          />
        </div>
      )}
    </div>
  );
}
