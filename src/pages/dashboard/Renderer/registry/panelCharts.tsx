import React from 'react';

import Timeseries from '../Renderer/TimeSeriesNG';
import Stat from '../Renderer/Stat';
import Table from '../Renderer/Table';
import TableNG from '../Renderer/TableNG';
import Text from '../Renderer/Text';
import Iframe from '../Renderer/Iframe';
import AiButton from '../Renderer/AiButton';
import Pie from '../Renderer/Pie';
import Hexbin from '../Renderer/Hexbin';
import BarGauge from '../Renderer/BarGauge';
import Gauge from '../Renderer/Gauge';
import Heatmap from '../Renderer/Heatmap';
import BarChart from '../Renderer/BarChart';
import type { PanelChartAdapter } from './types';

/**
 * 图表适配层：把注册表统一的 PanelChartProps 映射为各渲染器的入参。
 *
 * 所有图表同步加载，避免显示面板时再请求独立 chunk，因网络或发布版本切换而加载失败。
 * 编辑器选项面板仍由注册表单独按需加载，不进入查看态的静态依赖。
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

/** AI 按钮面板：只承载唤起 AI 对话的按钮，不依赖查询结果。 */
export const AiButtonPanel: PanelChartAdapter = (props) => <AiButton values={props.values} series={props.series} themeMode={props.themeMode} />;

/** 饼图。 */
export const PiePanel: PanelChartAdapter = (props) => <Pie {...props} />;

/** 六边形分箱图。 */
export const HexbinPanel: PanelChartAdapter = (props) => <Hexbin {...props} />;

/** 柱状仪表盘。 */
export const BarGaugePanel: PanelChartAdapter = (props) => <BarGauge {...props} />;

/** 仪表盘面板。 */
export const GaugePanel: PanelChartAdapter = (props) => <Gauge {...props} />;

/** 热力图。 */
export const HeatmapPanel: PanelChartAdapter = (props) => <Heatmap {...props} />;

/** 柱状图。 */
export const BarChartPanel: PanelChartAdapter = (props) => <BarChart {...props} />;
