import React, { useMemo, useRef, useState } from 'react';
import { Button } from 'antd';
import moment from 'moment';
import type uPlot from 'uplot';
import type { Options } from 'uplot';
import UPlotChart, { axisBuilder, cursorBuider, getStackedDataAndBands, paddingSide, scalesBuilder, seriesBuider, tooltipPlugin, uplotsMap } from '@/components/UPlotChart';
import { parseRange } from '@/components/TimeRangePicker';
import type { IRawTimeRange } from '@/components/TimeRangePicker';
import type { IStandardOptions } from '@/pages/dashboard/types';
import valueFormatter from '@/pages/dashboard/Renderer/utils/valueFormatter';
import type { DataFrame, PlotSeries } from './data';
import type { TimeSeriesOptions } from './index';

interface Props {
  id: string;
  width: number;
  height: number;
  frames: DataFrame;
  series: PlotSeries[];
  colors: string[];
  custom: TimeSeriesOptions['custom'];
  tooltip: TimeSeriesOptions['options']['tooltip'];
  standardOptions?: IStandardOptions;
  time: IRawTimeRange;
  darkMode: boolean;
  onZoomRangeChange?: (times?: Date[]) => void;
  zoomed?: boolean;
}

export default function Chart(props: Props) {
  const { id, frames, series, colors, custom, tooltip, standardOptions, darkMode, onZoomRangeChange, zoomed } = props;
  const chartRef = useRef<uPlot>();
  const initialYRange = useRef<[number, number]>();
  const [localZoomed, setLocalZoomed] = useState(false);
  const rangeKey = JSON.stringify(props.time);
  const xRange = useMemo<[number, number]>(() => {
    const range = parseRange(props.time);
    return [moment(range.start).unix(), moment(range.end).unix()];
  }, [rangeKey]);
  const { lineInterpolation, fillOpacity, stack } = custom;
  const { unit, decimals, dateFormat } = standardOptions || {};
  const { mode, sort } = tooltip;
  const stacked = useMemo(() => (stack === 'normal' && series.length ? getStackedDataAndBands(frames) : undefined), [stack, frames, series.length]);
  const data = useMemo<DataFrame>(() => (stacked ? [frames[0], ...stacked.data] : frames), [frames, stacked]);

  const baseOptions = useMemo<Omit<Options, 'width' | 'height'>>(() => {
    const format = (value: number) => String(valueFormatter({ unit, decimals, dateFormat }, value).text ?? '');
    const plotSeries = stacked ? series.map((item, index) => ({ ...item, n9e_internal: { ...item.n9e_internal, values: frames[index + 1] } })) : series;
    return {
      padding: [paddingSide, paddingSide, paddingSide, paddingSide],
      legend: { show: false },
      plugins: [
        tooltipPlugin({
          id,
          mode: mode === 'all' ? 'all' : 'single',
          sort: sort === 'asc' ? 'asc' : 'desc',
          pinningEnabled: true,
          graphTooltip: 'default',
          pointValueformatter: format,
        }),
      ],
      cursor: { ...cursorBuider({}), ...(onZoomRangeChange ? { drag: { x: true, y: false, setScale: false } } : {}) },
      scales: {
        ...scalesBuilder({ xMinMax: xRange }),
        // 查询范围决定默认边界；稀疏数据、空结果或 setData 都不能自动收窄 X 轴。
        x: {
          min: xRange[0],
          max: xRange[1],
          auto: false,
          // uPlot 在空数据初始化或 setData 时可能传入空边界，仍须保留查询范围。
          range: (_chart, min, max) => [min ?? xRange[0], max ?? xRange[1]],
        },
      },
      series: seriesBuider({ baseSeries: plotSeries, colors, pathsType: lineInterpolation === 'smooth' ? 'spline' : 'linear', fillOpacity, points: { show: false, size: 6 } }),
      ...(stacked ? { bands: stacked.bands } : {}),
      axes: [axisBuilder({ isTime: true, theme: darkMode ? 'dark' : 'light' }), axisBuilder({ scaleKey: 'y', theme: darkMode ? 'dark' : 'light', formatValue: format })],
      hooks: {
        setSelect: [
          (chart) => {
            if (onZoomRangeChange && chart.select.width > 0) {
              onZoomRangeChange([new Date(chart.posToVal(chart.select.left, 'x') * 1000), new Date(chart.posToVal(chart.select.left + chart.select.width, 'x') * 1000)]);
            }
          },
        ],
        setScale: [
          (chart, key) => {
            if (key === 'x' && chart.status === 1 && !onZoomRangeChange) {
              setLocalZoomed(chart.scales.x.min !== xRange[0] || chart.scales.x.max !== xRange[1]);
            }
          },
        ],
      },
    };
  }, [id, colors, series, stacked, frames, lineInterpolation, fillOpacity, mode, sort, unit, decimals, dateFormat, darkMode, xRange, onZoomRangeChange]);
  const options = useMemo<Options>(() => ({ ...baseOptions, width: props.width, height: props.height }), [baseOptions, props.width, props.height]);

  return (
    <div className='prom-timeseries-graph'>
      <UPlotChart
        id={id}
        options={options}
        data={data}
        onCreate={(_, chart) => {
          chartRef.current = chart;
          const { y } = chart.scales;
          initialYRange.current = typeof y.min === 'number' && typeof y.max === 'number' ? [y.min, y.max] : undefined;
          uplotsMap.set(id, chart);
          setLocalZoomed(false);
        }}
        onDelete={() => {
          uplotsMap.delete(id);
          chartRef.current = undefined;
        }}
      />
      {(zoomed || localZoomed) && (
        <Button
          className='prom-timeseries-reset-zoom'
          onClick={() => {
            if (onZoomRangeChange) {
              onZoomRangeChange();
            } else if (chartRef.current) {
              chartRef.current.setScale('x', { min: xRange[0], max: xRange[1] });
              if (initialYRange.current) {
                chartRef.current.setScale('y', { min: initialYRange.current[0], max: initialYRange.current[1] });
              }
            }
            setLocalZoomed(false);
          }}
        >
          Reset zoom
        </Button>
      )}
    </div>
  );
}
