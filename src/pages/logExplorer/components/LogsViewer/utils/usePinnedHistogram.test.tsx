/** @jest-environment jsdom */
import React, { useLayoutEffect, useRef, useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import usePinnedHistogram from './usePinnedHistogram';
import { getScrollViewport } from './scrollParent';

function Fixture() {
  const [pinned, setPinned] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = rootRef.current!;
    for (const node of Array.from(root.querySelectorAll<HTMLElement>('[data-block]'))) {
      node.getClientRects = () => ({ length: 1 } as DOMRectList);
      node.getBoundingClientRect = () => ({ height: Number(node.dataset.block) } as DOMRect);
    }
    Object.defineProperty(root, 'clientHeight', { value: 600 });
    root.getBoundingClientRect = () => ({ top: 0 } as DOMRect);
  }, []);
  usePinnedHistogram(chartRef, pinned);
  return (
    <div ref={rootRef} data-testid='page' style={{ overflowY: 'auto' }}>
      <div>
        <aside className='n9e-log-sidebar' style={{ position: 'relative' }}>
          sidebar
        </aside>
        <div>
          <main data-log-query-main>
            <div data-block='60' data-testid='query' style={{ position: 'relative' }}>
              query
            </div>
            <div data-block='30' data-testid='filters'>
              filters
            </div>
            <div ref={chartRef} data-block='130' data-testid='chart'>
              <button onClick={() => setPinned(!pinned)}>toggle</button>
            </div>
            <div data-testid='results'>results</div>
          </main>
        </div>
      </div>
    </div>
  );
}

it('defaults to normal scrolling; pinning stacks every preceding block and restores styles on unpin', async () => {
  render(<Fixture />);
  expect(screen.getByTestId('query')).toHaveStyle({ position: 'relative' });
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByTestId('query')).toHaveStyle({ position: 'sticky', top: '0px' });
  expect(screen.getByTestId('filters')).toHaveStyle({ position: 'sticky', top: '60px' });
  expect(screen.getByTestId('chart')).toHaveStyle({ position: 'sticky', top: '90px' });
  expect(screen.getByTestId('results').closest('[data-log-query-main]')).toHaveAttribute('data-log-pinned-height', '220');
  expect(getScrollViewport(screen.getByTestId('page'), screen.getByTestId('results'))).toEqual({ top: 220, height: 380 });
  // A fullscreen scroller inside the page is not obstructed by its pinned header.
  expect(getScrollViewport(screen.getByTestId('results'), screen.getByTestId('results')).top).toBe(0);
  fireEvent.click(screen.getByRole('button'));
  await waitFor(() => expect(screen.getByTestId('query')).toHaveStyle({ position: 'relative' }));
  expect(screen.getByTestId('chart').style.position).toBe('');
  expect(screen.getByTestId('results').closest('[data-log-query-main]')).not.toHaveAttribute('data-log-pinned-height');
});
