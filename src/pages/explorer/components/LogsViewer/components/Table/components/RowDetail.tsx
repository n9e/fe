import React, { useRef, useEffect } from 'react';

interface RowDetailProps {
  children: React.ReactNode;
  rowId: number | string;
  onHeightChange: (rowId: number | string, height: number) => void;
}

export default function RowDetail({ children, rowId, onHeightChange }: RowDetailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastHeightRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current) return;
      const height = containerRef.current.offsetHeight;
      // 只在高度真正变化时才更新
      if (height !== lastHeightRef.current) {
        lastHeightRef.current = height;
        onHeightChange(rowId, height);
      }
    });

    resizeObserver.observe(containerRef.current);

    // 初始测量
    const height = containerRef.current.offsetHeight || 300;
    lastHeightRef.current = height;
    onHeightChange(rowId, height);

    return () => resizeObserver.disconnect();
  }, [rowId, onHeightChange]);

  return <div ref={containerRef}>{children}</div>;
}
