import React, { useId, useMemo } from 'react';
import { arc, interpolateRgb } from 'd3';
import type { IGaugeStyles, IThresholds } from '../../../types';
import { gaugeDefaultThresholds } from '../../registry/defaults';
import {
  getFormattedThresholds,
  getGaugeContentWidth,
  getGaugeNameMaxLength,
  getGaugeTextOffsets,
  getGaugeThresholdLabelAngle,
  getGaugeThresholdLabelAnchor,
  getGaugeThresholdLabelOrientation,
  getGaugeThresholdLabelRadius,
  getGaugeValueFontSize,
} from './utils';
import './style.less';

type Point = [number, number | string | null];

interface Props {
  min?: number;
  max?: number;
  value: number;
  formattedValue?: string | number;
  valueUnit?: string;
  name?: string;
  color?: string;
  bgColor?: string;
  width?: number;
  height?: number;
  thresholds?: IThresholds;
  custom: IGaugeStyles;
  data?: Point[];
}

const SIZE = 200;
const CENTER = SIZE / 2;
const ARC_VIEWBOX_LEFT = 8;
const ARC_VIEWBOX_TOP = -8;
const ARC_VIEWBOX_WIDTH = 184;
const ARC_VIEWBOX_HEIGHT = 150;
export const ARC_GAUGE_HEIGHT_TO_WIDTH_RATIO = ARC_VIEWBOX_HEIGHT / ARC_VIEWBOX_WIDTH;
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function arcPath(outerRadius: number, innerRadius: number, startAngle: number, endAngle: number, rounded = false) {
  return (
    arc()
      .outerRadius(outerRadius)
      .innerRadius(innerRadius)
      .cornerRadius(rounded ? (outerRadius - innerRadius) / 2 : 0)
      .startAngle(startAngle)
      .endAngle(endAngle)({ innerRadius, outerRadius, startAngle, endAngle }) || undefined
  );
}

function getThresholdColor(progress: number, thresholds: Array<{ start: number; end: number; color: string }>, range: number) {
  const thresholdStops = thresholds.map((threshold) => ({ progress: clamp(threshold.start / range, 0, 1), color: threshold.color }));
  const finalThreshold = thresholds[thresholds.length - 1];
  if (finalThreshold) thresholdStops.push({ progress: clamp(finalThreshold.end / range, 0, 1), color: finalThreshold.color });

  if (!thresholdStops.length || progress <= thresholdStops[0].progress) return thresholdStops[0]?.color ?? '#73bf69';

  for (let index = 0; index < thresholdStops.length - 1; index++) {
    const from = thresholdStops[index];
    const to = thresholdStops[index + 1];
    if (progress <= to.progress) {
      const span = to.progress - from.progress;
      return span > 0 ? interpolateRgb(from.color, to.color)((progress - from.progress) / span) : to.color;
    }
  }

  return thresholdStops[thresholdStops.length - 1].color;
}

function Sparkline({ data, color, width }: { data: Point[]; color: string; width: number }) {
  const points = useMemo(() => {
    const values = data.map((item) => Number(item[1])).filter(Number.isFinite);
    if (values.length < 2) return '';
    const stride = Math.max(1, Math.ceil(values.length / 80));
    const sampled = values.filter((_, index) => index % stride === 0 || index === values.length - 1);
    const min = Math.min(...sampled);
    const range = Math.max(...sampled) - min || 1;
    return sampled.map((value, index) => `${CENTER - width / 2 + (index / (sampled.length - 1)) * width},${CENTER + 36 - ((value - min) / range) * 16}`).join(' ');
  }, [data, width]);

  return points ? <polyline className='renderer-gauge-sparkline' points={points} stroke={color} /> : null;
}

export default function Gauge(props: Props) {
  const reactId = useId().replace(/:/g, '');
  const min = props.min ?? 0;
  const max = props.max ?? 100;
  const width = props.width ?? 120;
  const custom = props.custom;
  const isCircle = (custom.style ?? 'arc') === 'circle';
  const showThresholds = custom.showThresholds !== false;
  const showThresholdLabels = custom.showLabels === true;
  // Labels and the threshold band each reserve room around the value arc. When
  // either is hidden, reclaim its space by growing the remaining gauge geometry.
  const thresholdOuterRadius = showThresholdLabels ? 82 : 90;
  const height = (props.height ?? 120) * (isCircle ? 1 : ARC_GAUGE_HEIGHT_TO_WIDTH_RATIO);
  // Arc shape comes from its angular sweep (rather than non-uniform scaling),
  // keeping the gauge and all of its geometry at a uniform scale.
  const geometryOffsetY = isCircle ? 0 : -14;
  const geometryTransform = `translate(${CENTER}, ${CENTER + geometryOffsetY}) translate(-${CENTER}, -${CENTER})`;
  const contentOffsetY = isCircle ? 0 : -10;
  const contentTransform = `translate(${CENTER}, ${CENTER + geometryOffsetY + contentOffsetY}) translate(-${CENTER}, -${CENTER})`;
  const range = max > min ? max - min : 1;
  const startAngle = isCircle ? 0 : (-115 * Math.PI) / 180;
  const endAngle = isCircle ? Math.PI * 2 : (115 * Math.PI) / 180;
  const span = endAngle - startAngle;
  // Keep an intentionally generous inner circle: values, names and the optional
  // sparkline must always stay clear of the gauge bar.
  const barWidth = 24 * (custom.barWidthFactor ?? 1);
  const markerWidth = Math.max(4, barWidth / 7);
  const valueOuter = thresholdOuterRadius - (showThresholds ? markerWidth + 2 : 0);
  const valueInner = valueOuter - barWidth;
  const contentWidth = getGaugeContentWidth(valueInner);
  const color = props.color ?? '#73bf69';
  const background = props.bgColor ?? '#f4f5f5';
  const valueRatio = clamp((props.value - min) / range, 0, 1);
  const neutralRatio = clamp(((custom.neutralValue ?? min) - min) / range, 0, 1);
  const fillFrom = Math.min(valueRatio, neutralRatio);
  const fillTo = Math.max(valueRatio, neutralRatio);
  const segments = clamp(Math.floor(custom.segments ?? 1), 1, 100);
  const rounded = custom.barStyle === 'rounded' && segments === 1;
  const segmentSpacing = clamp(custom.segmentSpacing ?? 0.16, 0, 1);
  const fillStartAngle = startAngle + fillFrom * span;
  const fillEndAngle = startAngle + fillTo * span;
  const capRadius = (valueOuter - valueInner) / 2;
  const capCenterRadius = (valueOuter + valueInner) / 2;
  const getCapCenter = (angle: number) => ({ x: Math.sin(angle) * capCenterRadius, y: -Math.cos(angle) * capCenterRadius });
  // Keep the threshold color ramp visually continuous at the rendered size while
  // bounding the number of SVG sectors per gauge.
  const gradientSegments = Math.min(360, Math.max(120, Math.ceil(((2 * Math.PI * thresholdOuterRadius * width) / SIZE) * 0.4)));
  const thresholds = getFormattedThresholds(props.thresholds ?? { steps: gaugeDefaultThresholds, mode: 'absolute' }, min, max);
  const valueGradientSegments = Math.max(1, Math.ceil(gradientSegments * (fillTo - fillFrom)));
  const value = props.formattedValue ?? props.value;
  const isEmpty = value === null || value === undefined || value === '' || Number.isNaN(props.value);
  const glowId = `gauge-glow-${reactId}`;
  const endpointCenter = getCapCenter(fillEndAngle);
  const gaugeCenterY = CENTER + geometryOffsetY + contentOffsetY;
  const displayValue = isEmpty ? '-' : `${value}${props.valueUnit ? ` ${props.valueUnit}` : ''}`;
  const showValue = custom.textMode !== 'name' && custom.textMode !== 'none';
  const showName = (custom.textMode === 'valueAndName' || custom.textMode === 'name') && props.name;
  const nameMaxLength = getGaugeNameMaxLength(valueInner);
  const name = props.name && props.name.length > nameMaxLength ? `${props.name.slice(0, nameMaxLength - 1)}…` : props.name;
  const valueLength = String(displayValue).length;
  const valueFontSize = getGaugeValueFontSize(valueInner, valueLength);
  const textOffsets = getGaugeTextOffsets(valueFontSize, showValue, Boolean(showName));
  const textVerticalOffset = custom.showSparkline ? 0 : 8;
  const valueY = gaugeCenterY + textOffsets.value + textVerticalOffset;
  const nameY = gaugeCenterY + textOffsets.name + textVerticalOffset;
  const thresholdLabels = custom.showLabels
    ? Array.from(
        new Set([0, ...thresholds.map((threshold) => threshold.start), ...(custom.neutralValue == null ? [] : [clamp(custom.neutralValue - min, 0, range)]), max - min]),
      ).sort((a, b) => a - b)
    : [];

  return (
    <div className={`renderer-gauge-svg renderer-gauge-svg-${isCircle ? 'circle' : 'arc'}`} style={{ width, height }}>
      <svg
        viewBox={isCircle ? `0 0 ${SIZE} ${SIZE}` : `${ARC_VIEWBOX_LEFT} ${ARC_VIEWBOX_TOP} ${ARC_VIEWBOX_WIDTH} ${ARC_VIEWBOX_HEIGHT}`}
        preserveAspectRatio='xMidYMid meet'
        role='img'
        aria-label={String(value)}
      >
        <defs>
          <filter id={glowId} x='-50%' y='-50%' width='200%' height='200%'>
            <feGaussianBlur stdDeviation='4' result='blur' />
            <feMerge>
              <feMergeNode in='blur' />
              <feMergeNode in='SourceGraphic' />
            </feMerge>
          </filter>
        </defs>
        <g transform={geometryTransform}>
          {custom.centerGlow && <circle className='renderer-gauge-center-glow' cx={CENTER} cy={CENTER} r='52' fill={color} />}
          <g transform={`translate(${CENTER}, ${CENTER})`}>
            {segments > 1 ? (
              Array.from({ length: segments }, (_, index) => {
                const segmentStart = index / segments + segmentSpacing / (2 * segments);
                const segmentEnd = (index + 1) / segments - segmentSpacing / (2 * segments);
                return (
                  <path
                    key={`track-${index}`}
                    className='renderer-gauge-track-segment'
                    d={arcPath(valueOuter, valueInner, startAngle + segmentStart * span, startAngle + segmentEnd * span)}
                    fill={background}
                  />
                );
              })
            ) : (
              <path className='renderer-gauge-track' d={arcPath(valueOuter, valueInner, startAngle, endAngle, rounded)} fill={background} />
            )}
            {showThresholds &&
              !custom.gradient &&
              thresholds.map((threshold, index) => (
                <path
                  key={`${threshold.color}-${index}`}
                  d={arcPath(thresholdOuterRadius, thresholdOuterRadius - markerWidth, startAngle + (threshold.start / range) * span, startAngle + (threshold.end / range) * span)}
                  fill={threshold.color}
                />
              ))}
            {showThresholds && custom.gradient && (
              <g className='renderer-gauge-threshold-gradient' shapeRendering='geometricPrecision'>
                {Array.from({ length: gradientSegments }, (_, index) => {
                  const from = index / gradientSegments;
                  const to = (index + 1) / gradientSegments;
                  return (
                    <path
                      key={`gradient-${index}`}
                      d={arcPath(thresholdOuterRadius, thresholdOuterRadius - markerWidth, startAngle + from * span, startAngle + to * span)}
                      fill={getThresholdColor((from + to) / 2, thresholds, range)}
                    />
                  );
                })}
              </g>
            )}
            {segments === 1 && fillTo > fillFrom && (
              <g className='renderer-gauge-value-fill' filter={custom.barGlow ? `url(#${glowId})` : undefined} shapeRendering='geometricPrecision'>
                {custom.gradient ? (
                  Array.from({ length: valueGradientSegments }, (_, index) => {
                    const progressStart = fillFrom + (index / valueGradientSegments) * (fillTo - fillFrom);
                    const progressEnd = fillFrom + ((index + 1) / valueGradientSegments) * (fillTo - fillFrom);
                    const midpoint = (progressStart + progressEnd) / 2;
                    return (
                      <path
                        key={index}
                        d={arcPath(valueOuter, valueInner, startAngle + progressStart * span, startAngle + progressEnd * span)}
                        fill={getThresholdColor(midpoint, thresholds, range)}
                      />
                    );
                  })
                ) : (
                  <path d={arcPath(valueOuter, valueInner, fillStartAngle, fillEndAngle)} fill={color} />
                )}
                {rounded && (
                  <g className='renderer-gauge-bar-caps'>
                    {[
                      { endpoint: 'start', angle: fillStartAngle, progress: fillFrom },
                      { endpoint: 'end', angle: fillEndAngle, progress: fillTo },
                    ].map(({ endpoint, angle, progress }) => {
                      const center = getCapCenter(angle);
                      return (
                        <circle
                          key={endpoint}
                          className='renderer-gauge-bar-cap'
                          data-endpoint={endpoint}
                          cx={center.x}
                          cy={center.y}
                          r={capRadius}
                          fill={custom.gradient ? getThresholdColor(progress, thresholds, range) : color}
                        />
                      );
                    })}
                  </g>
                )}
              </g>
            )}
            {segments > 1 &&
              Array.from({ length: segments }, (_, index) => {
                const segmentStart = index / segments + segmentSpacing / (2 * segments);
                const segmentEnd = (index + 1) / segments - segmentSpacing / (2 * segments);
                const fillSegmentStart = Math.max(segmentStart, fillFrom);
                const fillSegmentEnd = Math.min(segmentEnd, fillTo);
                return fillSegmentEnd > fillSegmentStart ? (
                  <path
                    key={index}
                    className='renderer-gauge-value-segment'
                    d={arcPath(valueOuter, valueInner, startAngle + fillSegmentStart * span, startAngle + fillSegmentEnd * span)}
                    fill={custom.gradient ? getThresholdColor((fillSegmentStart + fillSegmentEnd) / 2, thresholds, range) : color}
                    filter={custom.barGlow ? `url(#${glowId})` : undefined}
                  />
                ) : null;
              })}
          </g>
        </g>
        {custom.showSparkline && (
          <g transform={contentTransform}>
            <Sparkline data={props.data ?? []} color={color} width={contentWidth} />
          </g>
        )}
        {rounded && custom.endpointMarker && custom.endpointMarker !== 'none' && fillTo > fillFrom && (
          <circle
            cx={CENTER + endpointCenter.x}
            cy={CENTER + endpointCenter.y + geometryOffsetY}
            r={2.8}
            fill={color}
            filter={custom.endpointMarker === 'glow' ? `url(#${glowId})` : undefined}
          />
        )}
        {showValue && (
          <text className='renderer-gauge-value' x={CENTER} y={valueY} fontSize={valueFontSize}>
            {displayValue}
          </text>
        )}
        {showName && (
          <text className='renderer-gauge-name' x={CENTER} y={nameY}>
            {name}
          </text>
        )}
        {thresholdLabels.length > 0 && (
          <g className='renderer-gauge-range'>
            {thresholdLabels.map((value) => {
              const progress = range > 0 ? value / range : 0;
              const angle = startAngle + progress * span;
              const labelAngle = getGaugeThresholdLabelAngle(progress, angle, isCircle);
              const labelRadius = getGaugeThresholdLabelRadius(isCircle);
              const textAnchor = getGaugeThresholdLabelAnchor(progress, isCircle);
              // Keep labels on one radial track; pin 0 at the start and the trailing
              // percent sign at the end to match the label order around the arc.
              const isArcEndpoint = !isCircle && (progress <= 0 || progress >= 1);
              const { rotation, glyphRotation } = getGaugeThresholdLabelOrientation(labelAngle, isArcEndpoint);
              const rawX = CENTER + Math.sin(labelAngle) * labelRadius;
              const rawY = CENTER - Math.cos(labelAngle) * labelRadius;
              const x = clamp(rawX, 5, SIZE - 5);
              const y = rawY + geometryOffsetY;
              const percentage = `${Math.round(progress * 100)}%`;

              return (
                <text key={value} x={x} y={y} rotate={glyphRotation} textAnchor={textAnchor} transform={`rotate(${rotation} ${x} ${y})`}>
                  {percentage}
                </text>
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
}
