import React, { useState, useCallback } from 'react';
import _ from 'lodash';
import { HexGrid, Layout, Hexagon } from 'react-hexgrid';

import getRoundedHexagonPath from './utils/getRoundedHexagonPath';

interface Props {
  data: Array<{
    q: number;
    r: number;
    s: number;
    color: string;
    title: string;
    subtitle: string;
    tooltip?: string;
  }>;
  hexSize: number;
  viewBoxWidth: number;
  viewBoxHeight: number;
  minX: number;
  minY: number;
  options: {
    width: number;
    height: number;
    spacing?: number;
    enableRounded?: boolean;
  };
}

export default function HoneycombChart(props: Props) {
  const { data, hexSize, viewBoxWidth, viewBoxHeight, minX, minY, options } = props;
  const { width, height, spacing = 1.02, enableRounded = true } = options;
  const roundedPath = getRoundedHexagonPath(hexSize, enableRounded);
  const padding = 2;
  const viewBox = `${minX - padding} ${minY - padding} ${viewBoxWidth + padding * 2} ${viewBoxHeight + padding * 2}`;

  // 基于六边形尺寸计算文字容器区域（居中且不触碰边缘）
  const hexWidth = Math.sqrt(3) * hexSize;
  const hexHeight = 2 * hexSize;
  const textBoxWidth = hexWidth * 0.84;
  const textBoxHeight = hexHeight * 0.48;

  const [tooltipInfo, setTooltipInfo] = useState<{ visible: boolean; x: number; y: number; content: string }>({
    visible: false,
    x: 0,
    y: 0,
    content: '',
  });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleHexMouseEnter = useCallback((e: React.MouseEvent, hex: any, index: number) => {
    setHoveredIndex(index);
    setTooltipInfo({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      content: hex.tooltip || `${hex.title} - ${hex.subtitle}`,
    });
  }, []);

  const handleHexMouseMove = useCallback((e: React.MouseEvent) => {
    setTooltipInfo((prev) => ({
      ...prev,
      x: e.clientX,
      y: e.clientY,
    }));
  }, []);

  const handleHexMouseLeave = useCallback(() => {
    setHoveredIndex(null);
    setTooltipInfo((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <>
      <div className='relative inline-block'>
        <HexGrid width={width} height={height} viewBox={viewBox}>
          <Layout size={{ x: hexSize, y: hexSize }} flat={false} spacing={spacing} origin={{ x: 0, y: 0 }}>
            {data.map((hex, i) => (
              <Hexagon key={i} q={hex.q} r={hex.r} s={hex.s} cellStyle={{ fill: 'none' }}>
                {(() => {
                  const isActive = hoveredIndex === i;
                  return (
                    <>
                      <path
                        d={roundedPath}
                        fill={hex.color}
                        style={{
                          cursor: 'pointer',
                          transition: 'fill 120ms ease, filter 120ms ease',
                          filter: isActive ? 'brightness(0.9)' : 'none',
                        }}
                        onMouseEnter={(e) => handleHexMouseEnter(e, hex, i)}
                        onMouseMove={handleHexMouseMove}
                        onMouseLeave={handleHexMouseLeave}
                      />
                      <foreignObject x={-textBoxWidth / 2} y={-textBoxHeight / 2} width={textBoxWidth} height={textBoxHeight} pointerEvents='none'>
                        <div
                          style={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 3,
                            overflow: 'hidden',
                            textAlign: 'center',
                            lineHeight: 1.2,
                            padding: '2px 4px',
                            boxSizing: 'border-box',
                          }}
                        >
                          <div
                            style={{
                              maxWidth: '100%',
                              fontWeight: 600,
                              color: '#2c2c2c',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontSize: `clamp(12px, ${hexSize / 5}px, 20px)`,
                            }}
                            title={hex.title}
                          >
                            {hex.title}
                          </div>
                          <div
                            style={{
                              maxWidth: '100%',
                              color: '#4a4a4a',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontSize: `clamp(10px, ${hexSize / 6}px, 16px)`,
                            }}
                            title={hex.subtitle}
                          >
                            {hex.subtitle}
                          </div>
                        </div>
                      </foreignObject>
                    </>
                  );
                })()}
              </Hexagon>
            ))}
          </Layout>
        </HexGrid>
      </div>

      {/* 自定义提示框 */}
      {tooltipInfo.visible && (
        <div
          style={{
            position: 'fixed',
            left: tooltipInfo.x + 10,
            top: tooltipInfo.y + 10,
            backgroundColor: '#fff',
            border: '1px solid #d9d9d9',
            borderRadius: '2px',
            boxShadow: '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08)',
            padding: '8px 12px',
            fontSize: '14px',
            color: 'rgba(0, 0, 0, 0.85)',
            zIndex: 1000,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {tooltipInfo.content}
        </div>
      )}
    </>
  );
}
