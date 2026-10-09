import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Hexagon, HexGrid, Layout } from 'react-hexgrid';

import { createTextWidthMeasurer, getTextWidthInEm } from '@/utils/getTextWidth';

import './style.less';

import calculateHexCoordinates from './utils/calculateHexCoordinates';
import getRoundedHexagonPath from './utils/getRoundedHexagonPath';

const DEFAULT_SPACING = 1.02;
const MIN_VALUE_FONT_SIZE = 0.01;
const MAX_VALUE_FONT_SIZE = 24;
const VALUE_FONT_WEIGHT = 500;
const TEXT_LINE_HEIGHT = 1.2;
const TEXT_BOX_PADDING_Y = 2;
const TEXT_ROW_PADDING_X = 3;
const TEXT_ROW_PADDING_Y = 1;

function getValueFontSize(text: string, availableWidth: number, availableHeight: number, measureTextWidth: ReturnType<typeof createTextWidthMeasurer>) {
  if (!text || availableWidth <= 0 || availableHeight <= 0) {
    return MIN_VALUE_FONT_SIZE;
  }

  if (!measureTextWidth) {
    const estimatedFontSize = availableWidth / Math.max(getTextWidthInEm(text) * 1.08, 1);
    return Math.max(MIN_VALUE_FONT_SIZE, Math.min(MAX_VALUE_FONT_SIZE, availableHeight / 1.2, estimatedFontSize));
  }

  const fits = (fontSize: number) => measureTextWidth(text, { fontSize: `${fontSize}px` }) <= availableWidth;
  let minFontSize = MIN_VALUE_FONT_SIZE;
  let maxFontSize = Math.min(MAX_VALUE_FONT_SIZE, availableHeight / 1.2);
  if (!fits(minFontSize)) return minFontSize;
  if (fits(maxFontSize)) return maxFontSize;

  let fittedFontSize = minFontSize;
  for (let i = 0; i < 12; i++) {
    const fontSize = (minFontSize + maxFontSize) / 2;
    if (fits(fontSize)) {
      fittedFontSize = fontSize;
      minFontSize = fontSize;
    } else {
      maxFontSize = fontSize;
    }
  }

  return Math.floor(fittedFontSize * 100) / 100;
}

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
  const textBoxWidth = layout.hexSize * Math.sqrt(3) * 0.9;
  const textBoxHeight = layout.hexSize * 0.96;
  const showName = textMode === 'valueAndName' || textMode === 'name';
  const showValue = textMode === 'valueAndName' || textMode === 'value';
  const valueTextWidth = textBoxWidth - (fontBackground ? TEXT_ROW_PADDING_X * 2 : 0);
  const textGap = Math.min(3, layout.hexSize * 0.12);
  const textBoxVerticalPadding = TEXT_BOX_PADDING_Y * 2;
  const rowVerticalPadding = fontBackground ? TEXT_ROW_PADDING_Y * 2 : 0;
  const nameFontSize = Math.max(6, Math.min(20, layout.hexSize / 6));
  const [fontRevision, setFontRevision] = useState(0);
  const measureTextWidth = useMemo(() => {
    // 字体加载完成后通过 fontRevision 重建测量器，触发后续字号重算。
    void fontRevision;
    return showValue ? createTextWidthMeasurer({ fontWeight: VALUE_FONT_WEIGHT }) : null;
  }, [fontRevision, showValue]);
  const valueFontSizes = useMemo(() => {
    if (!showValue) return [];

    const fontSizeByNameState = new Map<boolean, Map<string, number>>();
    return data.map((cell) => {
      const hasName = showName && Boolean(cell.name);
      let fontSizeByValue = fontSizeByNameState.get(hasName);
      if (!fontSizeByValue) {
        fontSizeByValue = new Map<string, number>();
        fontSizeByNameState.set(hasName, fontSizeByValue);
      }

      const cachedFontSize = fontSizeByValue.get(cell.value);
      if (cachedFontSize !== undefined) return cachedFontSize;

      const nameRowHeight = hasName ? nameFontSize * TEXT_LINE_HEIGHT + rowVerticalPadding : 0;
      const valueTextHeight = textBoxHeight - textBoxVerticalPadding - nameRowHeight - (hasName ? textGap : 0) - rowVerticalPadding;
      const fontSize = getValueFontSize(cell.value, valueTextWidth, valueTextHeight, measureTextWidth);
      fontSizeByValue.set(cell.value, fontSize);
      return fontSize;
    });
  }, [data, measureTextWidth, nameFontSize, rowVerticalPadding, showName, showValue, textBoxHeight, textBoxVerticalPadding, textGap, valueTextWidth]);
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

  useEffect(() => {
    if (!showValue || typeof document === 'undefined' || !document.fonts) return;

    let isActive = true;
    void document.fonts.ready
      .then(() => {
        if (isActive) setFontRevision((revision) => revision + 1);
      })
      .catch(() => {
        // 字体加载失败时保持按当前字体测得的字号，不阻断渲染。
      });

    return () => {
      isActive = false;
    };
  }, [showValue]);

  if (!data.length || !width || !height || !layout.hexSize || !layout.viewBoxWidth || !layout.viewBoxHeight) {
    return null;
  }

  const padding = Math.max(2, layout.hexSize * 0.03);
  const viewBox = `${layout.minX - padding} ${layout.minY - padding} ${layout.viewBoxWidth + padding * 2} ${layout.viewBoxHeight + padding * 2}`;
  const textColor = fontBackground ? 'var(--fc-inverse-text-color)' : themeMode === 'dark' ? 'var(--fc-text-1)' : 'var(--fc-text-2)';
  const textStyle: React.CSSProperties = {
    maxWidth: '100%',
    overflow: 'hidden',
    textAlign: 'center',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: textColor,
    backgroundColor: fontBackground ? 'var(--fc-label-overlay-background)' : 'transparent',
    borderRadius: 2,
    padding: fontBackground ? `${TEXT_ROW_PADDING_Y}px ${TEXT_ROW_PADDING_X}px` : 0,
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
                        gap: textGap,
                        overflow: 'hidden',
                        lineHeight: TEXT_LINE_HEIGHT,
                        padding: `${TEXT_BOX_PADDING_Y}px 0`,
                        boxSizing: 'border-box',
                      }}
                    >
                      {showName && cell.name && <div style={{ ...textStyle, fontWeight: 400, fontSize: nameFontSize }}>{cell.name}</div>}
                      {showValue && (
                        <div
                          style={{
                            ...textStyle,
                            fontWeight: VALUE_FONT_WEIGHT,
                            fontSize: valueFontSizes[index] ?? MIN_VALUE_FONT_SIZE,
                            textOverflow: 'clip',
                          }}
                        >
                          {cell.value}
                        </div>
                      )}
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
