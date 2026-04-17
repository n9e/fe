import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
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

const MAX_VISIBLE_SLICES = 10;
const START_ANGLE = -90;

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radian = (angle * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radian),
    y: cy + radius * Math.sin(radian),
  };
}

function describeSector(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const angleDelta = endAngle - startAngle;
  if (angleDelta >= 359.999) {
    return `M ${cx} ${cy} m 0 ${-radius} a ${radius} ${radius} 0 1 1 0 ${radius * 2} a ${radius} ${radius} 0 1 1 0 ${-radius * 2} Z`;
  }

  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end = polarToCartesian(cx, cy, radius, endAngle);
  const largeArcFlag = angleDelta > 180 ? 1 : 0;

  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
}

function sortVersionKeys(keys: string[]): string[] {
  const withCoerced = keys.map((key) => ({ key, coerced: semver.coerce(key) }));
  const valid = withCoerced.filter((item) => item.coerced !== null);
  const invalid = withCoerced.filter((item) => item.coerced === null).map((item) => item.key);
  valid.sort((a, b) => semver.rcompare(a.coerced!, b.coerced!));
  return [...valid.map((item) => item.key), ...invalid];
}

export default function VersionsDistributionChart({ data, renderTooltip }: VersionsDistributionChartProps) {
  const { t } = useTranslation(NS);
  const { darkMode } = useContext(CommonStateContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 400, height: 104 });
  const [hoveredBar, setHoveredBar] = useState<BarItem | null>(null);

  const bars = useMemo(() => {
    if (!data || Object.keys(data).length === 0) {
      return [] as BarItem[];
    }

    const sortedKeys = sortVersionKeys(Object.keys(data));
    const total = sortedKeys.reduce((sum, key) => sum + (data[key] ?? 0), 0) || 1;
    const allBars: BarItem[] = sortedKeys.map((key, index) => ({
      label: key,
      value: data[key] ?? 0,
      percent: (((data[key] ?? 0) / total) * 100).toFixed(2) + '%',
      color: COLORS[index % COLORS.length],
    }));

    if (allBars.length <= MAX_VISIBLE_SLICES) {
      return allBars.filter((item) => item.value > 0);
    }

    const visibleBars = allBars.slice(0, MAX_VISIBLE_SLICES - 1);
    const hiddenBars = allBars.slice(MAX_VISIBLE_SLICES - 1);
    const otherValue = hiddenBars.reduce((sum, item) => sum + item.value, 0);

    return [
      ...visibleBars,
      {
        label: t('other_versions'),
        value: otherValue,
        percent: ((otherValue / total) * 100).toFixed(2) + '%',
        color: COLORS[(MAX_VISIBLE_SLICES - 1) % COLORS.length],
        otherVersions: hiddenBars,
      },
    ].filter((item) => item.value > 0);
  }, [data, t]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({
        width: Math.max(1, Math.floor(width)),
        height: Math.max(1, Math.floor(height)),
      });
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      if (tooltipRef.current) {
        tooltipRef.current.style.display = 'none';
      }
      setHoveredBar(null);
    };
  }, []);

  const moveTooltip = (clientX: number, clientY: number) => {
    if (!tooltipRef.current) return;
    tooltipRef.current.style.display = 'block';
    (window as any).placement?.(tooltipRef.current, { left: clientX + 8, top: clientY + 16 }, 'bottom', 'start', { bound: document.body });
  };

  const handleSliceMouseEnter = (bar: BarItem, event: React.MouseEvent<SVGPathElement>) => {
    setHoveredBar(bar);
    moveTooltip(event.clientX, event.clientY);
  };

  const handleSliceMouseMove = (event: React.MouseEvent<SVGPathElement>) => {
    moveTooltip(event.clientX, event.clientY);
  };

  const handleMouseLeave = () => {
    setHoveredBar(null);
    if (tooltipRef.current) {
      tooltipRef.current.style.display = 'none';
    }
  };

  const total = bars.reduce((sum, item) => sum + item.value, 0) || 1;
  const svgWidth = Math.max(1, size.width);
  const svgHeight = Math.max(1, size.height);
  const radius = Math.max(0, Math.min(svgWidth, svgHeight) / 2 - 4);
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;
  let currentAngle = START_ANGLE;

  const slices = bars.map((bar) => {
    const angle = (bar.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    return {
      ...bar,
      path: describeSector(centerX, centerY, radius, startAngle, endAngle),
    };
  });

  if (!bars.length) {
    return (
      <div className='relative w-full h-full'>
        <div ref={containerRef} className='absolute inset-0 flex justify-center items-center'>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      </div>
    );
  }

  return (
    <div className='relative w-full h-full'>
      <div ref={containerRef} className='absolute inset-0 overflow-hidden'>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width={svgWidth} height={svgHeight} onMouseLeave={handleMouseLeave}>
          {slices.map((slice) => {
            const isHovered = hoveredBar?.label === slice.label;
            return (
              <path
                key={slice.label}
                d={slice.path}
                fill={slice.color}
                opacity={isHovered ? 0.72 : 1}
                style={{ cursor: renderTooltip ? 'pointer' : 'default' }}
                onMouseEnter={(event) => handleSliceMouseEnter(slice, event)}
                onMouseMove={handleSliceMouseMove}
              />
            );
          })}
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
