/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { createRef } from 'react';

import { useAutoScroll } from './utils';

const CLIENT_HEIGHT = 500;
const CLIENT_WIDTH = 300;

function createScrollContainer() {
  const element = document.createElement('div');
  const state = { scrollHeight: 1000, scrollTop: 500 };

  Object.defineProperty(element, 'scrollHeight', { configurable: true, get: () => state.scrollHeight });
  Object.defineProperty(element, 'clientHeight', { configurable: true, get: () => CLIENT_HEIGHT });
  Object.defineProperty(element, 'clientWidth', { configurable: true, get: () => CLIENT_WIDTH });
  element.getBoundingClientRect = () => ({ left: 0, top: 0, right: CLIENT_WIDTH + 6, bottom: CLIENT_HEIGHT, width: CLIENT_WIDTH + 6, height: CLIENT_HEIGHT, x: 0, y: 0, toJSON: () => ({}) });
  Object.defineProperty(element, 'scrollTop', {
    configurable: true,
    get: () => state.scrollTop,
    set: (next: number) => {
      state.scrollTop = next;
    },
  });

  const scrollTo = jest.fn((options: ScrollToOptions) => {
    state.scrollTop = options.top ?? state.scrollTop;
  });
  element.scrollTo = scrollTo as unknown as HTMLElement['scrollTo'];

  document.body.appendChild(element);

  return {
    element,
    scrollTo,
    scrollToPosition(scrollTop: number) {
      state.scrollTop = scrollTop;
      element.dispatchEvent(new Event('scroll'));
    },
    growContent(delta: number) {
      state.scrollHeight += delta;
    },
  };
}

function renderAutoScroll(element: HTMLElement) {
  const containerRef = createRef<HTMLElement>() as React.MutableRefObject<HTMLElement>;
  containerRef.current = element;
  return renderHook(() => useAutoScroll(containerRef));
}

describe('useAutoScroll', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 0;
    });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  it('默认跟随时滚动到底部', () => {
    const container = createScrollContainer();
    const { result } = renderAutoScroll(container.element);

    act(() => {
      result.current.maybeScrollToBottom('auto');
    });

    expect(container.scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: 'auto' });
  });

  it('用户向上滚动后暂停跟随', () => {
    const container = createScrollContainer();
    const { result } = renderAutoScroll(container.element);

    act(() => {
      container.scrollToPosition(0);
    });
    expect(result.current.autoScrollEnabled).toBe(false);

    act(() => {
      result.current.maybeScrollToBottom('auto');
    });
    expect(container.scrollTo).not.toHaveBeenCalled();
  });

  it('用户滑回底部附近后恢复跟随', () => {
    const container = createScrollContainer();
    const { result } = renderAutoScroll(container.element);

    act(() => {
      container.scrollToPosition(0);
    });
    act(() => {
      container.scrollToPosition(480);
    });
    expect(result.current.autoScrollEnabled).toBe(true);

    act(() => {
      result.current.maybeScrollToBottom('auto');
    });
    expect(container.scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: 'auto' });
  });

  it('程序滚动动画途中派发的 scroll 事件不会关闭跟随', () => {
    const container = createScrollContainer();
    const { result } = renderAutoScroll(container.element);

    act(() => {
      result.current.scrollToBottom('smooth');
    });

    // 平滑滚动动画途中内容继续变高，位置远离底部
    act(() => {
      container.growContent(600);
      container.scrollToPosition(500);
    });
    expect(result.current.autoScrollEnabled).toBe(true);

    container.scrollTo.mockClear();
    act(() => {
      result.current.maybeScrollToBottom('auto');
    });
    expect(container.scrollTo).toHaveBeenCalledWith({ top: 1600, behavior: 'auto' });
  });

  it('瞬时程序滚动后内容继续变高，滞后的 scroll 事件不会关闭跟随', () => {
    const container = createScrollContainer();
    const { result } = renderAutoScroll(container.element);

    act(() => {
      result.current.maybeScrollToBottom('auto');
    });

    act(() => {
      container.growContent(300);
      container.element.dispatchEvent(new Event('scroll'));
    });
    expect(result.current.autoScrollEnabled).toBe(true);
  });

  it('平滑滚动结束后重新按位置判定用户意图', () => {
    const container = createScrollContainer();
    const { result } = renderAutoScroll(container.element);

    act(() => {
      result.current.scrollToBottom('smooth');
      jest.runOnlyPendingTimers();
    });

    act(() => {
      container.scrollToPosition(0);
    });
    expect(result.current.autoScrollEnabled).toBe(false);
  });

  it('用户滚轮介入立即结束程序滚动窗口', () => {
    const container = createScrollContainer();
    const { result } = renderAutoScroll(container.element);

    act(() => {
      result.current.scrollToBottom('smooth');
    });

    act(() => {
      container.element.dispatchEvent(new Event('wheel'));
      container.scrollToPosition(0);
    });
    expect(result.current.autoScrollEnabled).toBe(false);
  });

  it('点击消息内容不会结束程序滚动窗口', () => {
    const container = createScrollContainer();
    const { result } = renderAutoScroll(container.element);

    act(() => {
      result.current.scrollToBottom('smooth');
    });

    act(() => {
      container.element.dispatchEvent(new MouseEvent('pointerdown', { clientX: 100 }));
      container.scrollToPosition(200);
    });
    expect(result.current.autoScrollEnabled).toBe(true);
  });

  it('按下滚动条立即结束程序滚动窗口', () => {
    const container = createScrollContainer();
    const { result } = renderAutoScroll(container.element);

    act(() => {
      result.current.scrollToBottom('smooth');
    });

    act(() => {
      container.element.dispatchEvent(new MouseEvent('pointerdown', { clientX: CLIENT_WIDTH + 3 }));
      container.scrollToPosition(200);
    });
    expect(result.current.autoScrollEnabled).toBe(false);
  });

  it('scrollToBottom 在跟随已关闭时仍强制滚动并恢复跟随', () => {
    const container = createScrollContainer();
    const { result } = renderAutoScroll(container.element);

    act(() => {
      container.scrollToPosition(0);
    });
    expect(result.current.autoScrollEnabled).toBe(false);

    act(() => {
      result.current.scrollToBottom('smooth');
    });

    expect(container.scrollTo).toHaveBeenCalledWith({ top: 1000, behavior: 'smooth' });
    expect(result.current.autoScrollEnabled).toBe(true);
  });
});
