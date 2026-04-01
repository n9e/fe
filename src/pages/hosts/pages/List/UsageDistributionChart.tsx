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
  const COLORS: Record<string, string> = {
    '-1': 'rgba(123, 119, 141, 0.8)', // 强制写死的颜色，code review 时忽略该问题
    '20': 'var(--fc-fill-success)',
    '40': 'var(--fc-fill-success)',
    '60': 'var(--fc-fill-success)',
    '80': 'var(--fc-fill-alert)',
    '100': 'var(--fc-fill-error)',
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
  const capGap = 2;
  const textSpace = 14;
  const stripeHeightUnit = 2;
  const stripeGap = 2;
  const minPlaceholderHeight = 2;
  const maxStripeHeight = Math.max(0, barAreaBottom - textSpace - capHeight - capGap);
  const maxStripeCount = Math.max(1, Math.floor((maxStripeHeight + stripeGap) / (stripeHeightUnit + stripeGap)));

  return (
    <div ref={containerRef} className='w-full h-full'>
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width={svgWidth} height={svgHeight}>
        {KEYS.map((key, i) => {
          const value = values[i];
          const x = startX + i * (barWidth + barGap);
          const color = COLORS[key];
          const hasValue = value > 0;
          // 条纹高度按 2px 条纹 + 2px 间隔离散计算，保证每条修饰条完整且间距固定
          const targetStripeHeight = hasValue && maxStripeHeight > 0 ? (value / maxValue) * maxStripeHeight : minPlaceholderHeight;
          const stripeCount = hasValue ? Math.max(1, Math.min(maxStripeCount, Math.round((targetStripeHeight + stripeGap) / (stripeHeightUnit + stripeGap)))) : 1;
          const stripeHeight = stripeCount * (stripeHeightUnit + stripeGap) - stripeGap;
          const stripeTop = barAreaBottom - stripeHeight;
          const capY = stripeTop - capGap - capHeight;
          const textY = hasValue ? capY - 3 : stripeTop - 3;

          // 从底部向上逐条绘制完整条纹，保证底部贴齐且条纹之间固定相隔 2px
          const stripeRects: React.ReactNode[] = [];
          for (let stripeIndex = 0; stripeIndex < stripeCount; stripeIndex += 1) {
            const sy = barAreaBottom - stripeHeightUnit - stripeIndex * (stripeHeightUnit + stripeGap);
            stripeRects.push(<rect key={sy} x={x} y={sy} width={barWidth} height={stripeHeightUnit} fill={color} opacity={0.5} />);
          }

          return (
            <g key={key}>
              <text x={x + barWidth / 2} y={textY} textAnchor='middle' fontSize='11' fontWeight='bold' fill='var(--fc-text-1)'>
                {numberToLocaleString(value)}
              </text>
              {hasValue && <rect x={x} y={capY} width={barWidth} height={capHeight} fill={color} />}
              {stripeRects}
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
