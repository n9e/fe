/** @jest-environment jsdom */
import React, { useLayoutEffect, useRef } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { DataGridHandle } from 'react-data-grid';
import useExternalGridScroll from './useExternalGridScroll';

function Fixture({ contentHeight = 350000 }: { contentHeight?: number }) {
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
    Object.defineProperty(elementRef.current!, 'clientHeight', { configurable: true, value: 600 });
    Object.defineProperty(elementRef.current!, 'scrollHeight', { configurable: true, value: contentHeight });
    parent.getBoundingClientRect = () => ({ top: 0 } as DOMRect);
    shellRef.current!.getBoundingClientRect = () => ({ top: 200 - parent.scrollTop } as DOMRect);
  }, []);
  const { viewportHeight: height } = useExternalGridScroll(shellRef, gridRef, contentHeight);
  return (
    <div ref={parentRef} data-testid='page' style={{ overflowY: 'auto' }}>
      <div ref={shellRef} style={{ height: contentHeight }}>
        <div ref={elementRef} data-testid='grid' style={{ height }} />
      </div>
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
