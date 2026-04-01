import React, { useContext, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';
import semver from 'semver';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Empty } from 'antd';

import { CommonStateContext } from '@/App';

import { NS } from '../../constants';

export interface BarItem {
  label: string;
  value: number;
  percent: string;
  color: string;
  otherVersions?: BarItem[];
}

interface VersionsDistributionChartProps {
  data?: { [key: string]: number };
  renderTooltip?: (bar: BarItem) => React.ReactNode;
}

const RIGHT_PADDING = 0;
const TOP_PADDING = 8;
const BOTTOM_PADDING = 6;
const BAR_GAP = 4;
const CAP_HEIGHT = 4;
const MIN_BAR_WIDTH = 10;
const MAX_BAR_WIDTH = 40;
const TICK_COUNT = 4;
const TICK_FONT_SIZE = 12;
const LABEL_CHAR_WIDTH = 6;
const LABEL_AXIS_GAP = 4;
const LABEL_EDGE_GAP = 4;
const COLORS = [
  'rgb(95, 208, 128)',
  'rgb(87, 209, 165)',
  'rgb(78, 211, 202)',
  'rgb(89, 188, 217)',
  'rgb(100, 165, 232)',
  'rgb(103, 123, 238)',
  'rgb(133, 100, 232)',
  'rgb(110, 67, 239)',
  'rgb(61, 89, 250)',
  'rgb(52, 144, 240)',
  'rgb(31, 169, 209)',
  'rgb(78, 198, 191)',
  'rgb(40, 204, 145)',
];

function sortVersionKeys(keys: string[]): string[] {
  const withCoerced = keys.map((k) => ({ key: k, coerced: semver.coerce(k) }));
  const valid = withCoerced.filter((item) => item.coerced !== null);
  const invalid = withCoerced.filter((item) => item.coerced === null).map((item) => item.key);
  valid.sort((a, b) => semver.rcompare(a.coerced!, b.coerced!));
  return [...valid.map((item) => item.key), ...invalid];
}

function formatTickLabel(tick: number): string {
  if (tick >= 1000) {
    const k = tick / 1000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return String(tick);
}

export default function VersionsDistributionChart({ data, renderTooltip }: VersionsDistributionChartProps) {
  const { t } = useTranslation(NS);
  const { darkMode } = useContext(CommonStateContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 400, height: 120 });
  const [hoveredBar, setHoveredBar] = useState<BarItem | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width: Math.max(width, 1), height: Math.max(height, 1) });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const positionTooltip = (e: React.MouseEvent) => {
    if (!tooltipRef.current) return;
    tooltipRef.current.style.display = 'block';
    (window as any).placement?.(tooltipRef.current, { left: e.clientX + 8, top: e.clientY + 16 }, 'bottom', 'start', { bound: document.body });
  };

  const handleBarMouseEnter = (bar: BarItem, e: React.MouseEvent) => {
    setHoveredBar(bar);
    positionTooltip(e);
  };

  const handleBarMouseMove = (e: React.MouseEvent) => {
    positionTooltip(e);
  };

  const handleSvgMouseLeave = () => {
    setHoveredBar(null);
    if (tooltipRef.current) tooltipRef.current.style.display = 'none';
  };

  if (!data || Object.keys(data).length === 0) {
    return (
      <div className='relative w-full h-full'>
        <div ref={containerRef} className='absolute inset-0 flex justify-center items-center'>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      </div>
    );
  }

  const svgWidth = size.width;
  const svgHeight = size.height;
  const barAreaHeight = svgHeight - TOP_PADDING - BOTTOM_PADDING;

  const sortedKeys = sortVersionKeys(Object.keys(data));
  const total = sortedKeys.reduce((sum, k) => sum + (data[k] ?? 0), 0) || 1;
  const allBars: BarItem[] = sortedKeys.map((k, i) => ({
    label: k,
    value: data[k] ?? 0,
    percent: (((data[k] ?? 0) / total) * 100).toFixed(2) + '%',
    color: COLORS[i % COLORS.length],
  }));

  const roughMax = Math.max(...allBars.map((b) => b.value), 1);
  const roughTicks = d3.scaleLinear().domain([0, roughMax]).range([barAreaHeight, 0]).nice().ticks(TICK_COUNT);
  const leftMargin = LABEL_EDGE_GAP + Math.max(...roughTicks.map((t) => formatTickLabel(t).length), 1) * LABEL_CHAR_WIDTH + LABEL_AXIS_GAP;

  const availableWidth = Math.max(0, Math.floor(svgWidth - leftMargin - RIGHT_PADDING));
  const maxBars = Math.max(1, Math.floor((availableWidth + BAR_GAP) / (MIN_BAR_WIDTH + BAR_GAP)));

  let bars: BarItem[];
  if (allBars.length > maxBars) {
    const visible = allBars.slice(0, maxBars - 1);
    const hiddenBars = allBars.slice(maxBars - 1);
    const otherValue = hiddenBars.reduce((sum, b) => sum + b.value, 0);
    bars = [
      ...visible,
      {
        label: t('other_versions'),
        value: otherValue,
        percent: ((otherValue / total) * 100).toFixed(2) + '%',
        color: COLORS[(maxBars - 1) % COLORS.length],
        otherVersions: hiddenBars,
      },
    ];
  } else {
    bars = allBars;
  }

  const n = bars.length;
  const rawBarWidth = Math.floor((availableWidth - (n - 1) * BAR_GAP) / n);
  const barWidth = Math.min(MAX_BAR_WIDTH, Math.max(MIN_BAR_WIDTH, rawBarWidth));
  const totalBarsWidth = n * barWidth + (n - 1) * BAR_GAP;
  const barsStartX = Math.round(leftMargin + (availableWidth - totalBarsWidth) / 2);

  const maxValue = Math.max(...bars.map((b) => b.value), 1);
  const yScale = d3.scaleLinear().domain([0, maxValue]).range([barAreaHeight, 0]).nice();
  const ticks = yScale.ticks(TICK_COUNT);
  const baselineY = Math.round(TOP_PADDING + (yScale(0) as number));
  const plotRightX = Math.round(svgWidth - RIGHT_PADDING);

  return (
    <div className='relative w-full h-full'>
      <div ref={containerRef} className='absolute inset-0 overflow-hidden'>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width={svgWidth} height={svgHeight} onMouseLeave={handleSvgMouseLeave}>
          <g>
            {ticks.map((tick) => {
              const y = Math.round(TOP_PADDING + (yScale(tick) as number));
              return (
                <g key={tick}>
                  <line x1={leftMargin} y1={y} x2={plotRightX} y2={y} style={{ stroke: darkMode ? 'var(--fc-fill-6)' : 'var(--fc-fill-3)', strokeWidth: 1 }} />
                  <text x={leftMargin - LABEL_AXIS_GAP} y={y + TICK_FONT_SIZE / 2 - 1} textAnchor='end' style={{ fontSize: TICK_FONT_SIZE, fill: 'var(--fc-text-4)' }}>
                    {formatTickLabel(tick)}
                  </text>
                </g>
              );
            })}
          </g>

          <g>
            {bars.map((bar, i) => {
              if (bar.value === 0) return null;
              const x = Math.round(barsStartX + i * (barWidth + BAR_GAP));
              const capY = Math.round(TOP_PADDING + (yScale(bar.value) as number));
              const totalBarH = Math.max(1, baselineY - capY);
              const capH = Math.min(CAP_HEIGHT, totalBarH);
              const bodyH = Math.max(0, totalBarH - capH);
              const bodyY = capY + capH;
              const isHovered = hoveredBar?.label === bar.label;
              const { color } = bar;

              return (
                <g key={bar.label} style={{ cursor: renderTooltip ? 'pointer' : 'default' }} onMouseEnter={(e) => handleBarMouseEnter(bar, e)} onMouseMove={handleBarMouseMove}>
                  <rect x={x} y={capY} width={barWidth} height={capH} style={{ fill: color }} />
                  {bodyH > 0 && <rect x={x} y={bodyY} width={barWidth} height={bodyH} style={{ fill: color, fillOpacity: 0.5 }} />}
                  {isHovered && totalBarH > 0 && <rect x={x} y={capY} width={barWidth} height={totalBarH} fill='white' fillOpacity={0.15} style={{ pointerEvents: 'none' }} />}
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      {ReactDOM.createPortal(
        <div
          ref={tooltipRef}
          className={classNames('rounded-lg shadow-md p-2', {
            'bg-fc-100': !darkMode,
            'bg-fc-200': darkMode,
          })}
          style={{ position: 'fixed', display: 'none', zIndex: 9999, pointerEvents: 'none', width: 240, minHeight: 40, maxHeight: 120 }}
        >
          {hoveredBar && renderTooltip?.(hoveredBar)}
        </div>,
        document.body,
      )}
    </div>
  );
}
