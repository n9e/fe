import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Empty } from 'antd';

import { NS } from '../../constants';
import numberToLocaleString from '../../utils/numberToLocaleString';

interface UsageDistributionChartProps {
  data?: { [key: string]: number };
  chartId: string;
}

export default function UsageDistributionChart({ data }: UsageDistributionChartProps) {
  const { t } = useTranslation(NS);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 232, height: 90 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!data || Object.keys(data).length === 0) {
    return (
      <div ref={containerRef} className='w-full h-full flex justify-center items-center'>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  const KEYS = ['-1', '20', '40', '60', '80', '100'];
  const CAP_COLORS: Record<string, string> = {
    '-1': 'rgb(123, 119, 141)', // 强制写死的颜色，code review 时忽略该问题
    '20': 'var(--fc-fill-success)',
    '40': 'var(--fc-fill-success)',
    '60': 'var(--fc-fill-success)',
    '80': 'var(--fc-fill-alert)',
    '100': 'var(--fc-fill-error)',
  };
  const BODY_OPACITY: Record<string, number> = {
    '-1': 0.3,
    '20': 0.4,
    '40': 0.4,
    '60': 0.4,
    '80': 0.4,
    '100': 0.4,
  };

  const values = KEYS.map((k) => data?.[k] ?? 0);
  const maxValue = Math.max(...values, 1);

  const svgWidth = Math.max(1, size.width);
  const svgHeight = Math.max(1, size.height);
  const preferredBarGap = 8;
  const numBars = 6;
  const maxBarGap = Math.floor((svgWidth - numBars) / (numBars - 1));
  const barGap = Math.max(0, Math.min(preferredBarGap, maxBarGap));
  const barWidth = Math.max(1, Math.floor((svgWidth - (numBars - 1) * barGap) / numBars));
  const startX = 0;
  // 底部预留空间：刻度线 4px + 间隔 3px + 12px 字体
  const bottomPadding = 19;
  const barAreaBottom = Math.max(0, svgHeight - bottomPadding);
  const capHeight = 4;
  const capGap = 0;
  const textSpace = 14;
  const minPlaceholderHeight = 2;
  const maxBarBodyHeight = Math.max(0, barAreaBottom - textSpace - capHeight - capGap);

  return (
    <div ref={containerRef} className='w-full h-full'>
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width={svgWidth} height={svgHeight}>
        {KEYS.map((key, i) => {
          const value = values[i];
          const x = startX + i * (barWidth + barGap);
          const color = CAP_COLORS[key];
          const hasValue = value > 0;
          const bodyHeight = hasValue && maxBarBodyHeight > 0 ? Math.max(minPlaceholderHeight, (value / maxValue) * maxBarBodyHeight) : minPlaceholderHeight;
          const bodyTop = barAreaBottom - bodyHeight;
          const capY = bodyTop - capGap - capHeight;
          const textY = hasValue ? capY - 3 : bodyTop - 3;

          return (
            <g key={key}>
              <text x={x + barWidth / 2} y={textY} textAnchor='middle' fontSize='11' fontWeight='bold' fill='var(--fc-text-1)'>
                {numberToLocaleString(value)}
              </text>
              <rect x={x} y={bodyTop} width={barWidth} height={bodyHeight} fill={color} opacity={BODY_OPACITY[key]} />
              {hasValue && <rect x={x} y={capY} width={barWidth} height={capHeight} fill={color} />}
            </g>
          );
        })}
        {/* "无数据" 标签：在第一个柱子正下方 */}
        <text x={startX + barWidth / 2} y={barAreaBottom + 16} textAnchor='middle' fontSize='11' fill='var(--fc-text-3)'>
          {t('no_data')}
        </text>
        {/* 第1和第2个柱子之间的刻度线（无标签） */}
        {(() => {
          const leftBarRight = startX + barWidth;
          const rightBarLeft = startX + barWidth + barGap;
          const tickX = (leftBarRight + rightBarLeft) / 2;
          return <line x1={tickX} y1={barAreaBottom} x2={tickX} y2={barAreaBottom + 4} stroke='var(--fc-text-3)' strokeWidth='1' />;
        })()}
        {/* 刻度线和标签：竖线在相邻柱子之间，从第2条线起依次显示 20% 40% 60% 80% */}
        {['20%', '40%', '60%', '80%'].map((label, idx) => {
          // 第 idx 条刻度线位于第 (idx+1) 和第 (idx+2) 个柱子之间（即柱子索引 idx+1 和 idx+2）
          const leftBarRight = startX + (idx + 1) * (barWidth + barGap) + barWidth;
          const rightBarLeft = startX + (idx + 2) * (barWidth + barGap);
          const tickX = (leftBarRight + rightBarLeft) / 2;
          return (
            <g key={label}>
              <line x1={tickX} y1={barAreaBottom} x2={tickX} y2={barAreaBottom + 4} stroke='var(--fc-text-3)' strokeWidth='1' />
              <text x={tickX} y={barAreaBottom + 16} textAnchor='middle' fontSize='11' fill='var(--fc-text-3)'>
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
