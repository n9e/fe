import { useRef } from 'react';
import isEqual from 'react-fast-compare';

/**
 * 仅用于面板配置等小对象。查询结果必须使用 revision，禁止传入该 Hook。
 */
export default function useStableValue<T>(value: T): T {
  const ref = useRef(value);
  if (!isEqual(ref.current, value)) {
    ref.current = value;
  }
  return ref.current;
}
