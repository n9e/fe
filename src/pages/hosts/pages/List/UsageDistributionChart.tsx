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
    '-1': 'var(--fc-fill-5)',
    '20': 'var(--fc-fill-success)',
    '40': 'var(--fc-fill-success)',
    '60': 'var(--fc-fill-success)',
    '80': 'var(--fc-fill-warning)',
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
  const maxStripeHeight = Math.max(0, barAreaBottom - textSpace - capHeight - capGap);

  return (
    <div ref={containerRef} className='w-full h-full'>
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width={svgWidth} height={svgHeight}>
        {KEYS.map((key, i) => {
          const value = values[i];
          // 条纹高度仅代表条纹区域，按比例缩放，最小 4px（至少显示 1 条）
          const stripeHeight = value > 0 && maxStripeHeight > 0 ? Math.max(4, Math.round((value / maxValue) * maxStripeHeight)) : 0;
          const x = startX + i * (barWidth + barGap);
          // 条纹从底部向上绘制，底部锚定在 barAreaBottom
          const stripeTop = barAreaBottom - stripeHeight;
          // cap 在条纹上方，中间留 capGap
          const capY = stripeTop - capGap - capHeight;
          const color = COLORS[key];

          // 从 stripeTop 向下逐条绘制条纹（每条 2px 填充 + 2px 间隔）
          // 从顶部锚定，保证第一条纹 y === stripeTop，与 cap 的间隔精确为 capGap
          const stripeRects: React.ReactNode[] = [];
          for (let sy = stripeTop; sy + 2 <= barAreaBottom; sy += 4) {
            stripeRects.push(<rect key={sy} x={x} y={sy} width={barWidth} height={2} fill={color} opacity={0.5} />);
          }

          return (
            <g key={key}>
              {value > 0 && (
                <text x={x + barWidth / 2} y={capY - 3} textAnchor='middle' fontSize='11' fontWeight='bold' fill='var(--fc-text-1)'>
                  {numberToLocaleString(value)}
                </text>
              )}
              {value > 0 && <rect x={x} y={capY} width={barWidth} height={capHeight} fill={color} />}
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
