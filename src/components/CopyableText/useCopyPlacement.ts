import { FocusEvent, useCallback, useEffect, useRef, useState } from 'react';
import { CopyPlacement, measureCopyPlacement } from './placement';

export default function useCopyPlacement(placement: CopyPlacement | undefined, value: string | undefined) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(false);
  const [truncated, setTruncated] = useState(false);
  const hovered = useRef(false);
  const keyboardFocused = useRef(false);
  const enterTimer = useRef<ReturnType<typeof setTimeout>>();
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>();
  const [layout, setLayout] = useState<ReturnType<typeof measureCopyPlacement>>();
  const update = useCallback(() => {
    if (placement && rootRef.current && contentRef.current) {
      const content = contentRef.current;
      setLayout(measureCopyPlacement(rootRef.current, content, placement));
      setTruncated([content, ...Array.from(content.querySelectorAll('a, button'))].some((element) => element.scrollWidth > element.clientWidth));
    }
  }, [placement]);
  const activate = () => {
    if (!placement) return;
    hovered.current = true;
    clearTimeout(leaveTimer.current);
    clearTimeout(enterTimer.current);
    if (!active) {
      update();
      enterTimer.current = setTimeout(() => setActive(true), 200);
    }
  };
  const hide = () => {
    if (!placement) return;
    clearTimeout(enterTimer.current);
    clearTimeout(leaveTimer.current);
    if (!hovered.current && !keyboardFocused.current) {
      leaveTimer.current = setTimeout(() => setActive(false), 100);
    }
  };
  const deactivate = () => {
    hovered.current = false;
    hide();
  };
  const focus = (event: FocusEvent<HTMLSpanElement>) => {
    // Mouse focus must not pin a copy control after the pointer leaves.
    if (!placement || !(event.target instanceof Element) || !event.target.matches(':focus-visible')) return;
    keyboardFocused.current = true;
    clearTimeout(enterTimer.current);
    clearTimeout(leaveTimer.current);
    update();
    setActive(true);
  };
  const blur = (event: FocusEvent<HTMLSpanElement>) => {
    if (event.relatedTarget instanceof Node && rootRef.current?.contains(event.relatedTarget)) return;
    keyboardFocused.current = false;
    hide();
  };

  useEffect(
    () => () => {
      clearTimeout(enterTimer.current);
      clearTimeout(leaveTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!placement || value === undefined) return;
    const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    if (!active && !touch) return;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    const observer = new ResizeObserver(schedule);
    if (rootRef.current) observer.observe(rootRef.current);
    if (rootRef.current?.parentElement) observer.observe(rootRef.current.parentElement);
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, true);
    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.target instanceof Element && rootRef.current && event.target.contains(rootRef.current)) schedule();
    };
    window.addEventListener('transitionend', onTransitionEnd, true);
    // Row hover fills may transition; sample the settled fill without polling.
    const settled = window.setTimeout(update, 350);
    return () => {
      clearTimeout(settled);
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('transitionend', onTransitionEnd, true);
    };
  }, [active, placement, update, value]);

  return { rootRef, contentRef, layout, active, truncated, activate, deactivate, focus, blur };
}
