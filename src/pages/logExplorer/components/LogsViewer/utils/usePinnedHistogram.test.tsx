/** @jest-environment jsdom */
import React, { useLayoutEffect, useRef, useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import usePinnedHistogram from './usePinnedHistogram';
import { getScrollViewport } from './scrollParent';

function Fixture({ paddingTop = 0, collapsed = false, offsetTop = 0 }: { paddingTop?: number; collapsed?: boolean; offsetTop?: number }) {
  const [pinned, setPinned] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = rootRef.current!;
    for (const node of Array.from(root.querySelectorAll<HTMLElement>('[data-block]'))) {
      node.getClientRects = () => ({ length: 1 } as DOMRectList);
      node.getBoundingClientRect = () => ({ height: Number(node.dataset.block) } as DOMRect);
    }
    root.querySelector<HTMLElement>('[data-log-query-main]')!.getBoundingClientRect = () => ({ top: paddingTop + offsetTop - root.scrollTop, left: 0 } as DOMRect);
    root.querySelector<HTMLElement>('[data-testid=results]')!.getBoundingClientRect = () => ({ top: paddingTop + offsetTop + 220 - root.scrollTop, height: 1000 } as DOMRect);
    Object.defineProperty(root, 'clientHeight', { value: 600 });
    root.getBoundingClientRect = () => ({ top: 0 } as DOMRect);
  }, []);
  usePinnedHistogram(chartRef, pinned);
  return (
    <div ref={rootRef} data-testid='page' style={{ overflowY: 'auto', paddingTop }}>
      <div>
        <aside className={`n9e-log-sidebar${collapsed ? ' n9e-log-sidebar-collapsed' : ''}`} style={{ position: 'relative' }}>
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
  expect(getScrollViewport(screen.getByTestId('results'), screen.getByTestId('results')).top).toBe(screen.getByTestId('results').getBoundingClientRect().top);
  fireEvent.click(screen.getByRole('button'));
  await waitFor(() => expect(screen.getByTestId('query')).toHaveStyle({ position: 'relative' }));
  expect(screen.getByTestId('chart').style.position).toBe('');
  expect(screen.getByTestId('results').closest('[data-log-query-main]')).not.toHaveAttribute('data-log-pinned-height');
});

it('keeps the collapsed button aligned and clips results instead of covering the card border', () => {
  const { container } = render(<Fixture paddingTop={16} offsetTop={20} collapsed />);
  const sidebar = container.querySelector<HTMLElement>('.n9e-log-sidebar')!;
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByTestId('query')).toHaveStyle({ top: '20px' });
  expect(screen.getByTestId('filters')).toHaveStyle({ top: '80px' });
  expect(screen.getByTestId('chart')).toHaveStyle({ top: '110px' });
  expect(sidebar).toHaveStyle({ top: '20px' });
  expect(getScrollViewport(screen.getByTestId('page'), screen.getByTestId('results'))).toEqual({ top: 256, height: 344 });
  expect(screen.getByTestId('query')).not.toHaveClass('n9e-log-pinned-start');
  expect(screen.getByTestId('results').style.clipPath).toBe('');
  expect(sidebar).toHaveStyle({ zIndex: '5' });
  screen.getByTestId('page').scrollTop = 100;
  fireEvent.scroll(screen.getByTestId('page'));
  expect(screen.getByTestId('results').style.clipPath).toBe('inset(100px 0 0)');
  screen.getByTestId('results').classList.add('n9e-logs-view-modal');
  fireEvent.scroll(screen.getByTestId('page'));
  expect(screen.getByTestId('results').style.clipPath).toBe('');
  screen.getByTestId('results').classList.remove('n9e-logs-view-modal');
  fireEvent.resize(window);
  expect(screen.getByTestId('query')).toHaveStyle({ top: '20px' });
  fireEvent.click(screen.getByRole('button'));
  expect(sidebar.style.top).toBe('');
  expect(sidebar.style.zIndex).toBe('');
  expect(screen.getByTestId('results').style.clipPath).toBe('');
  expect(screen.getByTestId('query').style.top).toBe('');
});
