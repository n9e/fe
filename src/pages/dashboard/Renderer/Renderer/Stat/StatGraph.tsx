import React, { useEffect, useMemo, useRef } from 'react';
import { useSize } from 'ahooks';
import uPlot from 'uplot';
import Color from 'color';
import 'uplot/dist/uPlot.min.css';

import { statHexPalette } from '../../../config';
import { buildStatSparklineData, hasDrawableSparklineValue } from './statGraphData';
import type { StatSparklinePoint } from './statGraphData';

interface Props {
  /** 当前单值对应的原始序列 */
  serie?: { data?: StatSparklinePoint[] };
  /** 阈值或值映射得到的数值颜色 */
  color?: string;
  colorMode: string;
  graphMode: string;
}

/** 背景色模式下线条与填充都使用半透明白色，保证在深色背景上可辨认。 */
const BACKGROUND_STROKE = 'rgba(255, 255, 255, 0.5)';
const BACKGROUND_FILL = 'rgba(255, 255, 255, 0.2)';
const AREA_FILL_OPACITY = 0.2;

/** 生成半透明填充色，保留原色相以匹配阈值和值映射颜色。 */
function toFillColor(color: string): string {
  try {
    return Color(color).alpha(AREA_FILL_OPACITY).toString();
  } catch (error) {
    // 颜色无法解析时退回纯色填充，避免因为配置颜色异常导致图表不渲染
    return color;
  }
}

/**
 * 构造 sparkline 配置：隐藏坐标轴、图例和光标，只保留一条填充折线。
 *
 * `spanGaps: false` 让空值处断线，不会把缺失点错误地连成趋势。
 */
function getSparklineOptions(width: number, height: number, stroke: string, fill: string): uPlot.Options {
  return {
    width,
    height,
    padding: [0, 0, 0, 0],
    cursor: { show: false },
    legend: { show: false },
    scales: {
      // sparkline 不展示时间轴，按数值处理避免毫秒时间戳被再次换算
      x: { time: false },
      y: { auto: true },
    },
    axes: [{ show: false }, { show: false }],
    series: [
      {},
      {
        stroke,
        width: 1,
        fill,
        spanGaps: false,
        points: { show: false },
      },
    ],
  };
}

/**
 * Stat 面板的迷你趋势图（uPlot 实现）。
 *
 * - 仅在 `graphMode === 'area'` 时渲染，保持与旧实现的展示条件一致；
 * - 尺寸来自容器实际测量结果，容器尺寸变化时重建图表；
 * - 颜色跟随阈值/值映射结果，背景色模式使用半透明白色；
 * - 数据更新通过 `setData` 增量刷新，避免每次查询都重建图表。
 */
export default function StatGraph({ serie, color, colorMode, graphMode }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<uPlot | null>(null);
  const size = useSize(containerRef);
  const data = useMemo(() => buildStatSparklineData(serie?.data), [serie]);
  const hasDrawableValue = useMemo(() => hasDrawableSparklineValue(serie?.data), [serie]);
  const stroke = colorMode === 'background' ? BACKGROUND_STROKE : color || statHexPalette[0];
  const fill = colorMode === 'background' ? BACKGROUND_FILL : toFillColor(color || statHexPalette[0]);
  const width = size?.width;
  const height = size?.height;

  useEffect(() => {
    if (graphMode !== 'area' || !hasDrawableValue || !containerRef.current || !width || !height) return undefined;
    // data 由下方 setData 增量更新，不放入依赖以避免每次查询都重建图表；
    // 重建时使用本次渲染的 data，保证尺寸/颜色变化不会画出旧数据。
    const chart = new uPlot(getSparklineOptions(width, height, stroke, fill), data, containerRef.current);
    chartRef.current = chart;
    return () => {
      chart.destroy();
      chartRef.current = null;
    };
  }, [graphMode, hasDrawableValue, width, height, stroke, fill]);

  useEffect(() => {
    chartRef.current?.setData(data);
  }, [data]);

  if (graphMode !== 'area') return null;

  return (
    <div className='renderer-stat-item-graph'>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}
