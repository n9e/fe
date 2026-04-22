import React, { useRef, useState, useCallback, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';

import { useDraggable } from './useDraggable';
import { useResizable, ResizeDirection } from './useResizable';
import './style.less';

interface FloatingPanelProps {
  visible: boolean;
  zIndex?: number;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  storageKey?: string;
  className?: string;
  children?: React.ReactNode;
}

interface PanelState {
  x: number;
  y: number;
  w: number;
  h: number;
}

const DIRECTIONS: ResizeDirection[] = ['tl', 't', 'tr', 'r', 'br', 'b', 'bl', 'l'];
const MARGIN = 16; // gap from viewport edge for default position

function loadState(key: string): PanelState | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as PanelState;
  } catch {
    return null;
  }
}

function saveState(key: string, state: PanelState) {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export default function FloatingPanel(props: FloatingPanelProps) {
  const { visible, zIndex = 1001, defaultWidth = 501, defaultHeight = 794, minWidth = 440, minHeight = 400, storageKey = 'ai-chat-floating-panel', className, children } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const posRef = useRef<{ x: number; y: number } | null>(null);
  const sizeRef = useRef({ w: defaultWidth, h: defaultHeight });

  const [style, setStyle] = useState<React.CSSProperties>({});

  const getDefaultPos = useCallback((w: number, h: number) => {
    // right side with margin, matching drawer position
    return {
      x: window.innerWidth - w - MARGIN,
      y: MARGIN,
    };
  }, []);

  const getDefaultSize = useCallback(() => {
    return {
      w: defaultWidth - MARGIN * 2,
      h: window.innerHeight - MARGIN * 2,
    };
  }, [defaultWidth]);

  const applyStyle = useCallback((pos: { x: number; y: number }, size: { w: number; h: number }) => {
    setStyle({ left: pos.x, top: pos.y, width: size.w, height: size.h });
  }, []);

  const persistState = useCallback(
    (pos: { x: number; y: number }, size: { w: number; h: number }) => {
      saveState(storageKey, { x: pos.x, y: pos.y, w: size.w, h: size.h });
    },
    [storageKey],
  );

  // initialise from cache or default position, runs once when first shown
  useLayoutEffect(() => {
    if (visible && posRef.current === null) {
      const cached = loadState(storageKey);
      let pos: { x: number; y: number };
      let size: { w: number; h: number };

      if (cached) {
        size = { w: Math.max(minWidth, cached.w), h: Math.max(minHeight, cached.h) };
        // clamp to viewport so panel isn't off-screen after resize
        const vpW = window.innerWidth;
        const vpH = window.innerHeight;
        pos = {
          x: Math.max(0, Math.min(vpW - 80, cached.x)),
          y: Math.max(0, Math.min(vpH - 80, cached.y)),
        };
      } else {
        size = getDefaultSize();
        pos = getDefaultPos(size.w, size.h);
      }

      posRef.current = pos;
      sizeRef.current = size;
      applyStyle(pos, size);
    }
  }, [visible, storageKey, minWidth, minHeight, getDefaultPos, getDefaultSize, applyStyle]);

  const getPosRef = useCallback(() => posRef.current ?? getDefaultPos(sizeRef.current.w, sizeRef.current.h), [getDefaultPos]);
  const getSizeRef = useCallback(() => sizeRef.current, []);

  const setPosRef = useCallback(
    (pos: { x: number; y: number }) => {
      posRef.current = pos;
      applyStyle(pos, sizeRef.current);
      persistState(pos, sizeRef.current);
    },
    [applyStyle, persistState],
  );

  const setSizeRef = useCallback(
    (size: { w: number; h: number }) => {
      sizeRef.current = size;
      const pos = posRef.current ?? getDefaultPos(size.w, size.h);
      applyStyle(pos, size);
      persistState(pos, size);
    },
    [applyStyle, getDefaultPos, persistState],
  );

  useDraggable(containerRef, getPosRef, setPosRef, {
    handleSelector: '.ai-chat-header',
  });

  const { startResize } = useResizable(containerRef, getPosRef, getSizeRef, setPosRef, setSizeRef, {
    minWidth,
    minHeight,
  });

  const panel = (
    <div ref={containerRef} className={`ai-chat-floating${className ? ` ${className}` : ''}`} style={{ zIndex, ...style, ...(!visible ? { display: 'none' } : {}) }}>
      {DIRECTIONS.map((dir) => (
        <div key={dir} className={`fp-resize-handle fp-${dir}`} onMouseDown={(e) => startResize(e, dir)} />
      ))}
      {children}
    </div>
  );

  return ReactDOM.createPortal(panel, document.body);
}
