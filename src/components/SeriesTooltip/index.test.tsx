/** @jest-environment jsdom */
import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';

import SeriesTooltip, { createSeriesTooltipElement, SERIES_TOOLTIP_OVERLAY_CLASS, SeriesTooltipContent, SeriesTooltipOverlay } from './index';
import type { SeriesTooltipParams } from './index';

describe('SeriesTooltip renderers', () => {
  const params = { metrics: { __name__: 'cpu_usage', ident: 'host-1' }, value: '12%' } as const;

  it('renders the same markup in React and native DOM', () => {
    const view = render(<SeriesTooltipContent {...params} />);
    const element = createSeriesTooltipElement(params);

    expect(element?.outerHTML).toBe(view.container.innerHTML);
    expect(view.container.querySelector('.n9e-series-tooltip-title')).toHaveTextContent('cpu_usage');
    expect(view.container.querySelector('.n9e-series-tooltip-value')).toHaveTextContent('12%');
    expect(view.container.querySelector('.n9e-series-tooltip-labels')).toHaveTextContent('ident: host-1');
  });

  it('renders nothing without content', () => {
    expect(createSeriesTooltipElement({})).toBeNull();
    expect(render(<SeriesTooltipContent />).container).toBeEmptyDOMElement();
  });

  const cases: Array<[string, SeriesTooltipParams]> = [
    ['title only', { metrics: { __name__: 'cpu' } }],
    ['value only', { value: 0 }],
    ['labels only', { metrics: { ident: 'host-1', zero: 0, empty: '', missing: null } }],
    ['legend only', { legend: 'CPU', metrics: { __name__: 'cpu', ident: 'host-1' } }],
    ['legend and value', { legend: 'CPU', value: '12%' }],
    ['empty content', { metrics: { __name__: '', missing: undefined }, value: '' }],
    ['untrusted text', { metrics: { __name__: '<img src=x onerror=alert(1)>', '<script>': '<b>host</b>' }, value: '<svg onload=alert(1)>' }],
  ];

  it.each(cases)('keeps the React and native DOM renderers consistent for %s', (_name, params) => {
    const view = render(<SeriesTooltipContent {...params} />);
    const element = createSeriesTooltipElement(params);

    expect(element?.outerHTML ?? '').toBe(view.container.innerHTML);
    expect(view.container.querySelector('img, script, b, svg')).toBeNull();
    expect(element?.querySelector('img, script, b, svg') ?? null).toBeNull();
  });

  it('renders a resolved legend without metric labels or an empty label list', () => {
    const view = render(<SeriesTooltipContent {...params} legend='Host CPU' />);

    expect(view.container.querySelector('.n9e-series-tooltip-title')).toHaveTextContent('Host CPU');
    expect(view.container.querySelector('.n9e-series-tooltip-labels')).toBeNull();
    expect(view.container).not.toHaveTextContent('ident: host-1');
  });

  it('renders labels without an empty header', () => {
    const view = render(<SeriesTooltipContent metrics={{ ident: 'host-1' }} />);

    expect(view.container.querySelector('.n9e-series-tooltip-header')).toBeNull();
    expect(view.getByRole('listitem')).toHaveTextContent('ident: host-1');
  });
});

describe('SeriesTooltipOverlay', () => {
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it('renders no portal when there is no displayable content', () => {
    render(<SeriesTooltipOverlay point={{ x: 30, y: 40 }} metrics={{ missing: null }} value='' />);

    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('repositions after content size changes and removes the portal and listener when content becomes empty', () => {
    jest.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(800);
    jest.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(600);
    const rect = { x: 0, y: 0, width: 200, height: 120, top: 0, right: 200, bottom: 120, left: 0, toJSON: () => ({}) };
    const measure = jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(rect);
    const removeListener = jest.spyOn(window, 'removeEventListener');
    const point = { x: 790, y: 590 };
    const view = render(<SeriesTooltipOverlay point={point} legend='CPU' value='12%' />);

    expect(screen.getByRole('tooltip')).toHaveStyle({ left: '580px', top: '460px' });

    measure.mockReturnValue({ ...rect, width: 300, height: 200, right: 300, bottom: 200 });
    view.rerender(<SeriesTooltipOverlay point={point} legend='Host memory' value='64MB' />);

    expect(screen.getByRole('tooltip')).toHaveStyle({ left: '480px', top: '380px' });
    expect(screen.getByRole('tooltip')).toHaveTextContent('Host memory');
    expect(screen.getByRole('tooltip')).toHaveTextContent('64MB');

    view.rerender(<SeriesTooltipOverlay point={point} />);
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(removeListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});

describe('SeriesTooltip interaction', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    cleanup();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('opens after the configured delay, uses a body portal, and hides on mouse leave', async () => {
    const view = render(
      <SeriesTooltip metrics={{ __name__: 'cpu', ident: 'host-1' }} value={0} mouseEnterDelay={0.5}>
        <button>Series</button>
      </SeriesTooltip>,
    );
    const trigger = screen.getByRole('button', { name: 'Series' });

    fireEvent.mouseEnter(trigger);
    act(() => jest.advanceTimersByTime(499));
    expect(screen.queryByRole('tooltip')).toBeNull();
    act(() => jest.advanceTimersByTime(1));

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toHaveTextContent('cpu');
    expect(tooltip.querySelector('.n9e-series-tooltip-value')).toHaveTextContent('0');
    expect(tooltip).toHaveTextContent('ident: host-1');
    expect(tooltip.closest(`.${SERIES_TOOLTIP_OVERLAY_CLASS}`)).toBeInTheDocument();
    expect(view.container).not.toContainElement(tooltip);

    fireEvent.mouseLeave(trigger);
    await act(async () => jest.advanceTimersByTime(500));
    // Jest 不加载 antd 样式，检查实际控制隐藏的 class。
    expect(tooltip.closest(`.${SERIES_TOOLTIP_OVERLAY_CLASS}`)).toHaveClass('ant-tooltip-hidden');
  });

  it('preserves the child and its click handler when no tooltip content exists', () => {
    const onClick = jest.fn();
    const view = render(
      <SeriesTooltip metrics={{ missing: null }} value=''>
        <button onClick={onClick}>Series</button>
      </SeriesTooltip>,
    );
    const trigger = screen.getByRole('button');

    expect(view.container.innerHTML).toBe('<button>Series</button>');
    fireEvent.click(trigger);
    fireEvent.mouseEnter(trigger);
    act(() => jest.advanceTimersByTime(1000));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('refreshes an open tooltip and removes its portal when content becomes empty', () => {
    const view = render(
      <SeriesTooltip metrics={{ __name__: 'cpu', ident: 'host-1' }} value='12%'>
        <button>Series</button>
      </SeriesTooltip>,
    );
    fireEvent.mouseEnter(screen.getByRole('button'));
    act(() => jest.advanceTimersByTime(500));
    expect(screen.getByRole('tooltip')).toHaveTextContent('ident: host-1');

    view.rerender(
      <SeriesTooltip metrics={{ __name__: 'mem', ident: 'host-2' }} legend='Host memory' value='64MB'>
        <button>Series</button>
      </SeriesTooltip>,
    );
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.querySelector('.n9e-series-tooltip-title')).toHaveTextContent('Host memory');
    expect(tooltip.querySelector('.n9e-series-tooltip-value')).toHaveTextContent('64MB');
    expect(tooltip.querySelector('.n9e-series-tooltip-labels')).toBeNull();
    expect(tooltip).not.toHaveTextContent('host-1');

    view.rerender(
      <SeriesTooltip>
        <button>Series</button>
      </SeriesTooltip>,
    );
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('cancels a pending hover when the trigger unmounts', () => {
    const view = render(
      <SeriesTooltip legend='CPU' mouseEnterDelay={0.5}>
        <button>Series</button>
      </SeriesTooltip>,
    );
    fireEvent.mouseEnter(screen.getByRole('button'));
    view.unmount();
    act(() => jest.advanceTimersByTime(1000));

    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
