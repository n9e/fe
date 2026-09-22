import React from 'react';

import Timeseries from '../Renderer/TimeSeriesNG';
import Stat from '../Renderer/Stat';
import Table from '../Renderer/Table';
import TableNG from '../Renderer/TableNG';
import Text from '../Renderer/Text';
import Iframe from '../Renderer/Iframe';
import { lazyPanelChart } from './lazyPanelChart';
import type { PanelChartAdapter } from './types';

/**
 * 图表适配层：把注册表统一的 PanelChartProps 映射为各渲染器的入参。
 *
 * 常用图表（timeseries / stat / table / tableNG / text / iframe）同步加载，
 * 低频图表通过 lazyPanelChart 按需加载，首次渲染时才拉取对应实现。
 */

/** 时序图（NG）：透传注解、时区和时间范围。 */
export const TimeseriesPanel: PanelChartAdapter = (props) => (
  <Timeseries
    id={props.id}
    values={props.values}
    series={props.series}
    dataRevision={props.dataRevision}
    annotations={props.annotations}
    setAnnotationsRefreshFlag={props.setAnnotationsRefreshFlag}
    themeMode={props.themeMode}
    time={props.time}
    timezone={props.timezone}
    setRange={props.setRange}
    isPreview={props.isPreview}
  />
);

/** 单值面板：需要面板容器引用，用于按阈值填充整个面板背景。 */
export const StatPanel: PanelChartAdapter = (props) => (
  <Stat values={props.values} series={props.series} dataRevision={props.dataRevision} bodyWrapRef={props.bodyWrapRef} themeMode={props.themeMode} isPreview={props.isPreview} />
);

/** legacy 表格：保留导出 CSV 的 ref 和系列原始结构。 */
export const TablePanel: PanelChartAdapter = (props) => (
  <Table ref={props.tableRef} values={props.values} series={props.series} themeMode={props.themeMode} isPreview={props.isPreview} />
);

/** NG 表格：消费原始 DashboardSeries，保留导出 CSV 的 ref 与列宽写回回调。 */
export const TablePanelNG: PanelChartAdapter = (props) => (
  <TableNG
    ref={props.tableNGRef}
    id={props.id}
    values={props.values}
    series={props.rawSeries}
    themeMode={props.themeMode}
    isPreview={props.isPreview}
    onOverridesChange={props.onOverridesChange}
  />
);

/** 文本面板：内容为 Markdown，不依赖查询结果。 */
export const TextPanel: PanelChartAdapter = (props) => <Text values={props.values} series={props.series} themeMode={props.themeMode} />;

/** iframe 面板：直接嵌入配置的地址。 */
export const IframePanel: PanelChartAdapter = (props) => <Iframe values={props.values} series={props.series} />;

/** 饼图，按需加载。 */
export const PiePanel = lazyPanelChart(() => import('../Renderer/Pie'));

/** 六边形分箱图，按需加载。 */
export const HexbinPanel = lazyPanelChart(() => import('../Renderer/Hexbin'));

/** 柱状仪表盘，按需加载。 */
export const BarGaugePanel = lazyPanelChart(() => import('../Renderer/BarGauge'));

/** 仪表盘面板，按需加载。 */
export const GaugePanel = lazyPanelChart(() => import('../Renderer/Gauge'));

/** 热力图，按需加载。 */
export const HeatmapPanel = lazyPanelChart(() => import('../Renderer/Heatmap'));

/** 柱状图，按需加载。 */
export const BarChartPanel = lazyPanelChart(() => import('../Renderer/BarChart'));
