/** @jest-environment jsdom */
import React from 'react';
import { fireEvent, render } from '@testing-library/react';

import HoneycombChart from './index';
import type { HoneycombCell } from './index';

jest.mock('@/utils/getTextWidth', () => ({
  createTextWidthMeasurer: () => null,
  getTextWidthInEm: (value: string) => value.length * 0.65,
}));

function createData(count: number): HoneycombCell[] {
  return Array.from({ length: count }, (_, index) => ({ id: String(index), name: `host-${index}`, value: '55.45', stat: 55.45, metric: {}, color: '#299764' }));
}

/** 从实际 SVG 路径、中心坐标和 viewBox 缩放，计算相邻边扣除描边后的屏幕像素间距。 */
function getVisibleGap(container: HTMLElement) {
  const svg = container.querySelector('svg')!;
  const [, , viewBoxWidth, viewBoxHeight] = svg.getAttribute('viewBox')!.split(' ').map(Number);
  const scale = Math.min(Number(svg.getAttribute('width')) / viewBoxWidth, Number(svg.getAttribute('height')) / viewBoxHeight);
  const cells = Array.from(container.querySelectorAll('.hexagon-group'));
  const centers = cells.map((cell) =>
    cell
      .getAttribute('transform')!
      .match(/translate\(([^,]+),\s*([^)]+)\)/)!
      .slice(1)
      .map(Number),
  );
  let nearestDistance = Infinity;
  centers.forEach(([x, y], index) => {
    centers.slice(index + 1).forEach(([nextX, nextY]) => {
      nearestDistance = Math.min(nearestDistance, Math.hypot(nextX - x, nextY - y));
    });
  });
  const path = cells[0].querySelector('path')!;
  const radius = -Number(path.getAttribute('d')!.match(/Q 0 ([\d.e+-]+)/)![1]);
  return (nearestDistance - Math.sqrt(3) * radius - Number(path.getAttribute('stroke-width'))) * scale;
}

describe('HoneycombChart cell spacing', () => {
  it.each([
    [6, 1308, 310],
    [6, 830, 1020],
    [17, 1170, 1020],
    [40, 400, 300],
    [100, 800, 200],
    [100, 320, 160],
  ])('keeps a 2px visible gap for %i cells in a %i × %i panel', (count, width, height) => {
    const view = render(<HoneycombChart data={createData(count)} width={width} height={height} textMode='valueAndName' />);

    expect(view.container.querySelectorAll('.hexagon-group')).toHaveLength(count);
    expect(getVisibleGap(view.container)).toBeCloseTo(2, 5);
  });

  it('preserves the gap when the panel resizes and when a cell is hovered', () => {
    const data = createData(6);
    const view = render(<HoneycombChart data={data} width={1308} height={310} textMode='value' />);
    expect(getVisibleGap(view.container)).toBeCloseTo(2, 5);

    view.rerender(<HoneycombChart data={data} width={400} height={800} textMode='value' />);
    expect(getVisibleGap(view.container)).toBeCloseTo(2, 5);

    fireEvent.mouseEnter(view.container.querySelector('path')!);
    expect(getVisibleGap(view.container)).toBeCloseTo(2, 5);
  });
});
