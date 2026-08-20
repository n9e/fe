/**
 * Jest 全局测试设置
 *
 * 1. 注入 @testing-library/jest-dom 的匹配器（toBeInTheDocument 等）
 * 2. 补齐 jsdom 缺失的浏览器 API（仅 window 存在时生效，node 环境的纯逻辑测试不受影响）
 */
import '@testing-library/jest-dom';

if (typeof window !== 'undefined') {
  const windowRef = window as unknown as Record<string, unknown>;

  // ResizeObserver：react-grid-layout / antd 等依赖
  if (!window.ResizeObserver) {
    class ResizeObserverStub {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    windowRef.ResizeObserver = ResizeObserverStub;
  }

  // IntersectionObserver：ahooks useInViewport 依赖
  if (!window.IntersectionObserver) {
    class IntersectionObserverStub {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }
    windowRef.IntersectionObserver = IntersectionObserverStub;
  }

  // matchMedia：antd 响应式 / 部分组件依赖
  if (!window.matchMedia) {
    windowRef.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      } as MediaQueryList);
  }
}
