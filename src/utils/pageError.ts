import { useEffect, useState } from 'react';

import { AppError } from './appError';

/**
 * 整页级错误的传递通道。
 *
 * 以前 403 是 `location.href = '/403'`，整页刷新过去，原来的 URL 和上下文全丢了，
 * 用户点后退还会再次触发 403 被弹回来，来回打转。现在改成把错误放进这个通道，
 * 由路由里的 PageErrorGate 就地渲染 —— URL 不变，后退也不再是死循环。
 */
let current: AppError | null = null;
const listeners = new Set<(error: AppError | null) => void>();

function emit() {
  listeners.forEach((listener) => listener(current));
}

/**
 * 一屏只展示一个错误：同一个页面可能十几个请求一起返回 403，第一个说了算，
 * 后面的忽略掉，避免错误信息互相覆盖。
 */
export function reportPageError(error: AppError) {
  if (current) return;
  current = error;
  emit();
}

export function clearPageError() {
  if (!current) return;
  current = null;
  emit();
}

export function usePageError(): AppError | null {
  const [error, setError] = useState<AppError | null>(current);
  useEffect(() => {
    // 订阅晚于错误上报时，补一次当前值，避免漏掉已经发生的错误
    setError(current);
    listeners.add(setError);
    return () => {
      listeners.delete(setError);
    };
  }, []);
  return error;
}
