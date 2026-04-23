import { useRef, useEffect } from 'react';

interface Pos {
  x: number;
  y: number;
}

interface UseDraggableOptions {
  handleSelector?: string;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export function useDraggable(containerRef: React.RefObject<HTMLElement>, getPosRef: () => Pos, setPosRef: (pos: Pos) => void, options: UseDraggableOptions = {}) {
  const { handleSelector = '.ai-chat-header', onDragStart, onDragEnd } = options;

  const dragging = useRef(false);
  const startMouse = useRef<Pos>({ x: 0, y: 0 });
  const startPos = useRef<Pos>({ x: 0, y: 0 });

  // keep latest callbacks in refs so event handlers never go stale
  const getPosRefRef = useRef(getPosRef);
  const setPosRefRef = useRef(setPosRef);
  const onDragStartRef = useRef(onDragStart);
  const onDragEndRef = useRef(onDragEnd);
  const handleSelectorRef = useRef(handleSelector);

  getPosRefRef.current = getPosRef;
  setPosRefRef.current = setPosRef;
  onDragStartRef.current = onDragStart;
  onDragEndRef.current = onDragEnd;
  handleSelectorRef.current = handleSelector;

  useEffect(() => {
    // stable handler functions — never recreated, always read latest values via refs
    const onMouseDown = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const target = e.target as HTMLElement;
      const handle = el.querySelector(handleSelectorRef.current);
      if (!handle || !handle.contains(target)) return;
      if (target.closest('button, input, textarea, select, a, [role="button"]')) return;

      e.preventDefault();
      dragging.current = true;
      startMouse.current = { x: e.clientX, y: e.clientY };
      startPos.current = { ...getPosRefRef.current() };
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'move';
      onDragStartRef.current?.();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - startMouse.current.x;
      const dy = e.clientY - startMouse.current.y;

      let newX = startPos.current.x + dx;
      let newY = startPos.current.y + dy;

      const vpW = window.innerWidth;
      const vpH = window.innerHeight;
      const el = containerRef.current;
      if (el) {
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        newX = Math.max(-w + 80, Math.min(vpW - 80, newX));
        newY = Math.max(0, Math.min(vpH - 80, newY));
      }

      setPosRefRef.current({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      onDragEndRef.current?.();
    };

    // poll until containerRef.current is available (Portal may render async)
    let rafId: number;
    const tryBind = () => {
      const el = containerRef.current;
      if (el) {
        el.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      } else {
        rafId = requestAnimationFrame(tryBind);
      }
    };
    tryBind();

    return () => {
      cancelAnimationFrame(rafId);
      const el = containerRef.current;
      if (el) el.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef]);
}
