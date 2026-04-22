import { useRef, useCallback, useEffect } from 'react';

export type ResizeDirection = 't' | 'r' | 'b' | 'l' | 'tl' | 'tr' | 'bl' | 'br';

interface Size {
  w: number;
  h: number;
}

interface Pos {
  x: number;
  y: number;
}

interface UseResizableOptions {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export function useResizable(
  containerRef: React.RefObject<HTMLElement>,
  getPosRef: () => Pos,
  getSizeRef: () => Size,
  setPosRef: (pos: Pos) => void,
  setSizeRef: (size: Size) => void,
  options: UseResizableOptions = {},
) {
  const { minWidth = 440, minHeight = 400 } = options;

  const resizing = useRef<ResizeDirection | null>(null);
  const startMouse = useRef<Pos>({ x: 0, y: 0 });
  const startPos = useRef<Pos>({ x: 0, y: 0 });
  const startSize = useRef<Size>({ w: 0, h: 0 });

  // keep latest callbacks in refs
  const getPosRefRef = useRef(getPosRef);
  const getSizeRefRef = useRef(getSizeRef);
  const setPosRefRef = useRef(setPosRef);
  const setSizeRefRef = useRef(setSizeRef);
  const minWidthRef = useRef(minWidth);
  const minHeightRef = useRef(minHeight);

  getPosRefRef.current = getPosRef;
  getSizeRefRef.current = getSizeRef;
  setPosRefRef.current = setPosRef;
  setSizeRefRef.current = setSizeRef;
  minWidthRef.current = minWidth;
  minHeightRef.current = minHeight;

  // startResize is called from JSX onMouseDown — keep stable via ref pattern
  const startResize = useCallback((e: React.MouseEvent, dir: ResizeDirection) => {
    e.preventDefault();
    e.stopPropagation();
    resizing.current = dir;
    startMouse.current = { x: e.clientX, y: e.clientY };
    startPos.current = { ...getPosRefRef.current() };
    startSize.current = { ...getSizeRefRef.current() };
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const dir = resizing.current;
      if (!dir) return;

      const dx = e.clientX - startMouse.current.x;
      const dy = e.clientY - startMouse.current.y;

      let { x, y } = startPos.current;
      let { w, h } = startSize.current;
      const minW = minWidthRef.current;
      const minH = minHeightRef.current;

      if (dir.includes('r')) {
        w = Math.max(minW, w + dx);
      }
      if (dir.includes('b')) {
        h = Math.max(minH, h + dy);
      }
      if (dir.includes('l')) {
        const newW = Math.max(minW, w - dx);
        x = x + (w - newW);
        w = newW;
      }
      if (dir.includes('t')) {
        const newH = Math.max(minH, h - dy);
        y = y + (h - newH);
        h = newH;
      }

      setPosRefRef.current({ x, y });
      setSizeRefRef.current({ w, h });
    };

    const onMouseUp = () => {
      if (!resizing.current) return;
      resizing.current = null;
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { startResize };
}
