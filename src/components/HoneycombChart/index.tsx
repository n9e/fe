import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Hexagon, HexGrid, Layout } from 'react-hexgrid';

import './style.less';

import calculateHexCoordinates from './utils/calculateHexCoordinates';
import getRoundedHexagonPath from './utils/getRoundedHexagonPath';

const DEFAULT_SPACING = 1.02;

export interface HoneycombCell {
  id: string;
  name?: string;
  value: string;
  stat: number | string | null;
  metric: Record<string, string | undefined>;
  color: string;
}

interface Props {
  data: HoneycombCell[];
  width: number;
  height: number;
  textMode: 'valueAndName' | 'name' | 'value';
  fontBackground?: boolean;
  themeMode?: 'dark' | 'light';
  onCellClick?: (cell: HoneycombCell) => void;
}

interface TooltipState {
  x: number;
  y: number;
  cell: HoneycombCell;
}

export default function HoneycombChart({ data, width, height, textMode, fontBackground = false, themeMode, onCellClick }: Props) {
  const layout = useMemo(() => calculateHexCoordinates(data.length, width, height, DEFAULT_SPACING), [data.length, height, width]);
  const roundedPath = useMemo(() => getRoundedHexagonPath(layout.hexSize), [layout.hexSize]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const handleMouseEnter = useCallback((event: React.MouseEvent<SVGPathElement>, cell: HoneycombCell, index: number) => {
    setHoveredIndex(index);
    setTooltip({ x: event.clientX, y: event.clientY, cell });
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent<SVGPathElement>) => {
    setTooltip((previous) => (previous ? { ...previous, x: event.clientX, y: event.clientY } : previous));
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
    setTooltip(null);
  }, []);

  useEffect(() => {
    setHoveredIndex(null);
    setTooltip(null);
  }, [data, height, width]);

  if (!data.length || !width || !height || !layout.hexSize || !layout.viewBoxWidth || !layout.viewBoxHeight) {
    return null;
  }

  const padding = Math.max(2, layout.hexSize * 0.03);
  const viewBox = `${layout.minX - padding} ${layout.minY - padding} ${layout.viewBoxWidth + padding * 2} ${layout.viewBoxHeight + padding * 2}`;
  const textBoxWidth = layout.hexSize * Math.sqrt(3) * 0.84;
  const textBoxHeight = layout.hexSize * 0.96;
  const textColor = fontBackground ? 'var(--fc-inverse-text-color)' : themeMode === 'dark' ? 'var(--fc-text-1)' : 'var(--fc-text-2)';
  const showName = textMode === 'valueAndName' || textMode === 'name';
  const showValue = textMode === 'valueAndName' || textMode === 'value';
  const nameFontSize = Math.max(6, Math.min(20, layout.hexSize / 5));
  const valueFontSize = Math.max(6, Math.min(20, layout.hexSize / 6));
  const textStyle: React.CSSProperties = {
    maxWidth: '100%',
    overflow: 'hidden',
    textAlign: 'center',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: textColor,
    backgroundColor: fontBackground ? 'var(--fc-label-overlay-background)' : 'transparent',
    borderRadius: 2,
    padding: fontBackground ? '1px 3px' : 0,
    boxSizing: 'border-box',
  };
  const tooltipElement =
    tooltip && typeof document !== 'undefined'
      ? createPortal(
          <div className='honeycomb-chart-tooltip' style={{ left: tooltip.x + 10, top: tooltip.y + 10 }}>
            <div>
              <strong>
                {tooltip.cell.metric.__name__ || 'value'}: {tooltip.cell.value}
              </strong>
            </div>
            {Object.entries(tooltip.cell.metric)
              .filter(([key]) => key !== '__name__')
              .map(([key, value]) => (
                <div key={key}>
                  {key}: {value}
                </div>
              ))}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <HexGrid width={width} height={height} viewBox={viewBox}>
        <Layout size={{ x: layout.hexSize, y: layout.hexSize }} flat={false} spacing={DEFAULT_SPACING} origin={{ x: 0, y: 0 }}>
          {data
            .map((cell, index) => {
              const coordinate = layout.coordinates[index];
              if (!coordinate) return null;

              const isHovered = hoveredIndex === index;

              return (
                <Hexagon key={cell.id || index} q={coordinate.q} r={coordinate.r} s={coordinate.s} cellStyle={{ fill: 'none' }} onDragStart={(event) => event.preventDefault()}>
                  <path
                    d={roundedPath}
                    fill={cell.color}
                    stroke={isHovered ? (themeMode === 'dark' ? 'var(--fc-text-1)' : 'var(--fc-text-2)') : cell.color}
                    strokeWidth={2}
                    style={{
                      cursor: onCellClick ? 'pointer' : 'default',
                      filter: isHovered ? 'brightness(0.9)' : 'none',
                      transition: 'filter 120ms ease',
                    }}
                    onMouseEnter={(event) => handleMouseEnter(event, cell, index)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => onCellClick?.(cell)}
                  />
                  <foreignObject x={-textBoxWidth / 2} y={-textBoxHeight / 2} width={textBoxWidth} height={textBoxHeight} pointerEvents='none'>
                    <div
                      style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: Math.min(3, layout.hexSize * 0.12),
                        overflow: 'hidden',
                        lineHeight: 1.2,
                        padding: '2px 4px',
                        boxSizing: 'border-box',
                      }}
                    >
                      {showName && cell.name && <div style={{ ...textStyle, fontWeight: 600, fontSize: nameFontSize }}>{cell.name}</div>}
                      {showValue && <div style={{ ...textStyle, fontSize: valueFontSize }}>{cell.value}</div>}
                    </div>
                  </foreignObject>
                </Hexagon>
              );
            })
            .filter((element): element is React.ReactElement => element !== null)}
        </Layout>
      </HexGrid>
      {tooltipElement}
    </>
  );
}
