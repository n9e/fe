import { useEffect, useState } from 'react';

/**
 * 首次获得有效尺寸后保持挂载状态。
 *
 * 页签隐藏时容器宽度会变为 0。只记录组件是否已完成首次测量，不缓存宽度，
 * 以便切回时继续使用实时尺寸，同时避免时序图组件被卸载后重复查询。
 */
export default function useKeepMountedAfterFirstMeasure(width: number | undefined, enabled: boolean) {
  const [hasMeasured, setHasMeasured] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setHasMeasured(false);
    } else if (width) {
      setHasMeasured(true);
    }
  }, [enabled, width]);

  return hasMeasured;
}
