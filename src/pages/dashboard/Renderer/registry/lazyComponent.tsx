import React, { useEffect, useState } from 'react';

/** 加载失败兜底组件接收的 props。 */
export interface LazyLoadErrorProps {
  error: string;
  onRetry: () => void;
}

export interface LazyComponentFallbacks {
  Loading: React.ComponentType;
  Error: React.ComponentType<LazyLoadErrorProps>;
}

/**
 * 把动态 import 包装成可重试的普通组件。
 *
 * 与 `React.lazy` 的差异：
 * - 失败后可以直接重试（重新执行 loader），不会被永久缓存的 rejected promise 卡死；
 * - 加载中/加载失败由调用方提供局部兜底，不会冒泡到根节点导致整页不可用；
 * - 组件卸载后忽略迟到的加载结果。
 *
 * @param load 返回模块的加载器，必须能被重复调用（失败重试会再次执行）。
 */
export function createLazyComponent<Props extends object>(
  load: () => Promise<{ default: React.ComponentType<Props> }>,
  fallbacks: LazyComponentFallbacks,
): React.ComponentType<Props> {
  // 必须改名：局部标识符 `Error` 会遮蔽全局 `Error`，使 catch 里的 `err instanceof Error` 失效
  const { Loading, Error: ErrorFallback } = fallbacks;

  function LazyComponent(props: Props) {
    const [attempt, setAttempt] = useState(0);
    const [component, setComponent] = useState<React.ComponentType<Props>>();
    const [error, setError] = useState<string>();

    useEffect(() => {
      let cancelled = false;
      setComponent(undefined);
      setError(undefined);
      load()
        .then((module) => {
          if (!cancelled) setComponent(() => module.default);
        })
        .catch((err: unknown) => {
          if (!cancelled) setError(err instanceof Error ? err.message : String(err));
        });
      return () => {
        cancelled = true;
      };
    }, [attempt, load]);

    if (error) {
      return <ErrorFallback error={error} onRetry={() => setAttempt((value) => value + 1)} />;
    }

    if (!component) {
      return <Loading />;
    }

    const Component = component;
    return <Component {...props} />;
  }
  LazyComponent.displayName = 'LazyComponent';

  return LazyComponent;
}
