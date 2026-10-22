/** @jest-environment jsdom */
import React, { useLayoutEffect, useRef } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { DataGridHandle } from 'react-data-grid';
import useExternalGridScroll from './useExternalGridScroll';

function Fixture({ contentHeight = 350000, pinnedHeight = 0 }: { contentHeight?: number; pinnedHeight?: number }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<DataGridHandle>({
    get element() {
      return elementRef.current;
    },
  } as DataGridHandle);
  useLayoutEffect(() => {
    const parent = parentRef.current!;
    Object.defineProperty(parent, 'clientHeight', { configurable: true, value: 600 });
    Object.defineProperty(elementRef.current!, 'clientHeight', { configurable: true, get: () => parseFloat(elementRef.current!.style.height) || 0 });
    Object.defineProperty(elementRef.current!, 'scrollHeight', { configurable: true, value: contentHeight });
    parent.getBoundingClientRect = () => ({ top: 0 } as DOMRect);
    shellRef.current!.getBoundingClientRect = () => ({ top: 200 - parent.scrollTop } as DOMRect);
  }, []);
  const { top, viewportHeight: height } = useExternalGridScroll(shellRef, gridRef, contentHeight);
  return (
    <div ref={parentRef} data-testid='page' style={{ overflowY: 'auto' }}>
      <main data-log-query-main data-log-pinned-height={pinnedHeight || undefined}>
        <div ref={shellRef} style={{ height: contentHeight }}>
          <div ref={elementRef} data-testid='grid' style={{ height, top }} />
        </div>
      </main>
    </div>
  );
}

it('keeps a viewport-sized grid for large datasets and drives virtual scrolling from the page', async () => {
  render(<Fixture />);
  const page = screen.getByTestId('page');
  const grid = screen.getByTestId('grid');
  await waitFor(() => expect(grid).toHaveStyle({ height: '600px' }));
  page.scrollTop = 1800;
  fireEvent.scroll(page);
  expect(grid.scrollTop).toBe(1600);
  page.scrollTop = 400000;
  fireEvent.scroll(page);
  expect(grid.scrollTop).toBe(349400);
});

it('transfers keyboard-driven internal scrolling back to the page, including the space above the grid', async () => {
  render(<Fixture />);
  const page = screen.getByTestId('page');
  const grid = screen.getByTestId('grid');
  await waitFor(() => expect(grid).toHaveStyle({ height: '600px' }));
  grid.scrollTop = 35;
  fireEvent.scroll(grid);
  expect(page.scrollTop).toBe(235);
  fireEvent.scroll(page);
  expect(grid.scrollTop).toBe(35);
});

it('keeps clustering/table grid headers below the pinned toolbar and recalculates when the trend is hidden or unpinned', async () => {
  const { rerender } = render(<Fixture pinnedHeight={180} />);
  const page = screen.getByTestId('page');
  const grid = screen.getByTestId('grid');
  await waitFor(() => expect(grid).toHaveStyle({ top: '180px', height: '420px' }));
  page.scrollTop = 1000;
  fireEvent.scroll(page);
  expect(grid.scrollTop).toBe(980);

  rerender(<Fixture pinnedHeight={60} />);
  fireEvent(page, new Event('log-chart-pin-change'));
  expect(grid).toHaveStyle({ top: '60px', height: '540px' });
  expect(grid.scrollTop).toBe(860);

  rerender(<Fixture />);
  fireEvent(page, new Event('log-chart-pin-change'));
  expect(grid).toHaveStyle({ top: '0px', height: '600px' });
  expect(grid.scrollTop).toBe(800);
});

it('uses the actual height for a few clusters without introducing an extra viewport of blank space', async () => {
  render(<Fixture contentHeight={142} pinnedHeight={180} />);
  await waitFor(() => expect(screen.getByTestId('grid')).toHaveStyle({ height: '142px', top: '180px' }));
  expect(screen.getByTestId('grid').scrollTop).toBe(0);
});
