import React, { useEffect, useRef } from 'react';
import { register, Chart } from '@antv/g2';

import { PRIMARY_COLOR } from '@/utils/constant';
import { hexPalette } from '@/pages/dashboard/config';

function customPalette() {
  return [PRIMARY_COLOR, ...hexPalette];
}

register('palette.custom', customPalette);

export interface TimeSeriesDataPoint {
  time: number | string; // 时间戳或时间字符串
  value: number;
  category?: string; // 用于堆叠图的分类
}

export interface TimeSeriesBarChartProps {
  darkMode?: boolean;
  data: TimeSeriesDataPoint[];
  width?: number;
  height?: number;
  onBarClick?: (data: TimeSeriesDataPoint) => void; // 柱子点击回调
  onBrushEnd?: (timeRange: [number, number]) => void; // 框选回调
  stacked?: boolean; // 是否堆叠
  stepMs?: number; // x 轴步长（毫秒），用于刻度格式化
}

const TimeSeriesBarChart: React.FC<TimeSeriesBarChartProps> = ({ darkMode, data, width, height = 400, onBarClick, onBrushEnd, stacked = false, stepMs }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!containerRef.current || !data || data.length === 0) return;

    // 清除旧图表
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // 创建图表
    const chart = new Chart({
      container: containerRef.current,
      autoFit: true,
      width: width,
      height: height,
      paddingTop: 0,
      paddingRight: 0,
    });

    chartRef.current = chart;

    // 处理数据，确保时间格式一致
    const processedData = data.map((item) => ({
      ...item,
      // 保持为数值时间戳，确保使用连续时间轴而非分类轴
      time: typeof item.time === 'number' ? item.time : new Date(item.time).getTime(),
      category: item.category || 'default',
    }));

    // 配置图表
    const intervalMark = chart
      .interval()
      .data(processedData)
      .encode('x', 'time')
      .encode('y', 'value')
      // 始终使用颜色编码以启用内置图例
      .encode('color', 'category')
      // 关闭动画
      .animate(false)
      .axis('x', {
        // 去除标题
        title: null,
        titleSpacing: 2,
        // 禁用自动旋转，水平展示
        labelAutoRotate: false,
        labelTransform: 'rotate(0)',
        tickFilter: (_datum, index, data) => {
          const approxLabelWidth = 150;
          const containerWidth = containerRef.current?.clientWidth || width || 800;
          const calculatedTickCount = Math.max(2, Math.floor(containerWidth / approxLabelWidth));
          // 只保留 calculatedTickCount 个刻度
          const step = Math.max(1, Math.floor(data.length / calculatedTickCount));
          if (index % step !== 0) {
            return false;
          }
          return true;
        },
        // 基于 stepMs 的格式化
        labelFormatter: (val: string) => {
          const date = new Date(val);
          const oneMinute = 60 * 1000;
          const oneDay = 24 * 60 * 60 * 1000;
          if (stepMs && stepMs >= oneDay) {
            // 显示 MM-DD
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            return `${mm}-${dd}`;
          }
          if (stepMs && stepMs >= oneMinute) {
            // 显示 hh:mm
            const hh = String(date.getHours()).padStart(2, '0');
            const mm = String(date.getMinutes()).padStart(2, '0');
            return `${hh}:${mm}`;
          }
          // 小于 1 分钟显示 hh:mm:ss
          const hh = String(date.getHours()).padStart(2, '0');
          const mm = String(date.getMinutes()).padStart(2, '0');
          const ss = String(date.getSeconds()).padStart(2, '0');
          return `${hh}:${mm}:${ss}`;
        },
      })
      .axis('y', {
        // 去除标题
        title: null,
      })
      .tooltip({
        title: (d: any) => {
          const date = new Date(d.time);
          return date.toLocaleString('zh-CN');
        },
      })
      .scale('color', { palette: 'custom' });

    // 如果是堆叠图，添加堆叠配置
    if (stacked) {
      intervalMark.transform({ type: 'stackY' });
    }

    // 设置图例位置和样式，以及自定义颜色
    const chartOptions: any = {};

    if (stacked) {
      chartOptions.legend = {
        color: {
          position: 'bottom',
          layout: {
            justifyContent: 'center',
          },
          crossPadding: 0,
          focus: true,
          focusMarkerSize: 12,
        },
      };
    }

    if (darkMode) {
      chartOptions.theme = { type: 'dark' };
    }

    chart.interaction('tooltip', {
      shared: stacked,
      crosshairs: true,
      render: (event: any, { container }: any) => {
        // 自定义 tooltip 渲染，确保不溢出屏幕
        const tooltipElement = container;
        if (tooltipElement) {
          // 获取 tooltip 的位置和尺寸
          const tooltipRect = tooltipElement.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;

          // 调整水平位置
          if (tooltipRect.right > viewportWidth) {
            const offsetX = tooltipRect.right - viewportWidth + 10;
            tooltipElement.style.left = `${parseFloat(tooltipElement.style.left || '0') - offsetX}px`;
          }
          if (tooltipRect.left < 0) {
            tooltipElement.style.left = '10px';
          }

          // 调整垂直位置
          if (tooltipRect.bottom > viewportHeight) {
            const offsetY = tooltipRect.bottom - viewportHeight + 10;
            tooltipElement.style.top = `${parseFloat(tooltipElement.style.top || '0') - offsetY}px`;
          }
          if (tooltipRect.top < 0) {
            tooltipElement.style.top = '10px';
          }
        }
      },
    });

    chart.options(chartOptions);

    // 添加框选交互
    chart.interaction('brushXHighlight', true);

    // 启用 G2 内置的图例单选过滤交互
    chart.interaction('legendFilter', true);

    // 渲染图表
    chart.render();

    // 监听绘图区域点击，命中最近的柱子（即使柱子高度很低）
    chart.on('plot:click', (event: any) => {
      if (!onBarClick) return;

      // 使用 snap 记录获取最近的柱子数据
      const records = chart.getDataByXY({ x: event.x, y: event.y }, { shared: stacked }) || [];
      if (!records.length) return;

      const clickedData = records[0];
      if (!clickedData) return;

      onBarClick({
        time: clickedData.time,
        value: clickedData.value,
        category: clickedData.category,
      });
    });

    // 监听框选事件
    chart.on('brush:end', (event: any) => {
      if (onBrushEnd && event.data?.selection) {
        const selection = event.data.selection;
        // 从选中的数据中提取时间范围
        if (selection.length > 0) {
          const times = selection[0];
          const x1 = times[0];
          const x2 = times[times.length - 1];
          if (x1 && x2) {
            onBrushEnd([x1, x2]);
          }
        }
      }
      try {
        // 尝试派发移除/清空事件
        // @ts-ignore
        chart.emit?.('brush:remove');
      } catch (e) {
        // ignore
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data, width, height, onBarClick, onBrushEnd, stacked, stepMs]);

  return <div ref={containerRef} />;
};

export default TimeSeriesBarChart;
