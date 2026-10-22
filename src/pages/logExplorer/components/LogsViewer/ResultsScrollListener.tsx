import React, { useEffect } from 'react';
import useScrollParent from './utils/useScrollParent';
import { getScrollEventTarget } from './utils/scrollParent';

/** Subscribe inside FullscreenButton.Provider so fullscreen changes rebind pagination. */
export default function ResultsScrollListener({ resultsRef, onScrollCapture }: { resultsRef: React.RefObject<HTMLDivElement>; onScrollCapture?: () => void }) {
  const scrollParent = useScrollParent(resultsRef);
  useEffect(() => {
    if (!scrollParent || !onScrollCapture) return;
    let frame = 0;
    const handleScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const results = resultsRef.current;
        // Clustering handles its own capture; retained hidden tabs must not paginate.
        if (results?.hasAttribute('data-log-results') && results.getClientRects().length) onScrollCapture();
      });
    };
    const target = getScrollEventTarget(scrollParent);
    target.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      target.removeEventListener('scroll', handleScroll);
    };
  }, [scrollParent, resultsRef, onScrollCapture]);
  return null;
}
