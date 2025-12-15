import React, { useEffect, useRef } from 'react';
import { Chart } from '@antv/g2';

export interface TimeSeriesDataPoint {
  time: number | string; // 时间戳或时间字符串
  value: number;
  category?: string; // 用于堆叠图的分类
}

export interface TimeSeriesBarChartProps {
  data: TimeSeriesDataPoint[];
  width?: number;
  height?: number;
  onBarClick?: (data: TimeSeriesDataPoint) => void; // 柱子点击回调
  onBrushEnd?: (timeRange: [number, number]) => void; // 框选回调
  stacked?: boolean; // 是否堆叠
  stepMs?: number; // x 轴步长（毫秒），用于刻度格式化
  colors?: string[]; // 自定义分类颜色数组
}

const TimeSeriesBarChart: React.FC<TimeSeriesBarChartProps> = ({ data, width, height = 400, onBarClick, onBrushEnd, stacked = false, stepMs, colors }) => {
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
      time: typeof item.time === 'number' ? new Date(item.time).toISOString() : item.time,
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
        // 禁用自动旋转，水平展示
        labelAutoRotate: false,
        labelTransform: 'rotate(0)',
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
      });

    // 如果是堆叠图，添加堆叠配置
    if (stacked) {
      intervalMark.transform({ type: 'stackY' });
    }

    // 设置图例位置和样式，以及自定义颜色
    const chartOptions: any = {
      legend: {
        color: {
          position: 'bottom',
          layout: {
            justifyContent: 'center',
          },
          crossPadding: 0,
          focus: true,
          focusMarkerSize: 12,
        },
      },
    };

    // 如果传入了自定义颜色，应用到 scale
    if (colors && colors.length > 0) {
      chartOptions.scales = {
        color: {
          palette: colors,
        },
      };
    }

    chart.interaction('tooltip', {
      shared: stacked,
    });

    chart.options(chartOptions);

    // 添加框选交互
    chart.interaction('brushXHighlight', true);

    // 启用 G2 内置的图例单选过滤交互
    chart.interaction('legendFilter', true);

    // 根据容器宽度与步长，动态设置 x 轴刻度数量，避免每柱一刻度
    try {
      const approxLabelWidth = 80; // 每个刻度预留像素
      const containerWidth = containerRef.current?.clientWidth || width || 800;
      const tickCount = Math.max(2, Math.floor(containerWidth / approxLabelWidth));
      chart.options({
        scales: {
          x: {
            nice: true,
            tickCount,
          },
        },
      });
    } catch {}

    // 渲染图表
    chart.render();

    // 监听柱子点击事件
    chart.on('interval:click', (event: any) => {
      if (onBarClick && event.data?.data) {
        const clickedData = event.data.data;
        onBarClick({
          time: clickedData.time,
          value: clickedData.value,
          category: clickedData.category,
        });
      }
    });

    // 监听框选事件
    chart.on('brush:end', (event: any) => {
      if (onBrushEnd && event.data?.selection) {
        const selection = event.data.selection;
        // 从选中的数据中提取时间范围
        if (selection.length > 0) {
          const [[x1, x2]] = selection;
          onBrushEnd([x1, x2]);
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
  }, [data, width, height, onBarClick, onBrushEnd, stacked, stepMs, colors]);

  return <div ref={containerRef} />;
};

export default TimeSeriesBarChart;
