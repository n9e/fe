import { useContext, useLayoutEffect, useState, RefObject } from 'react';
import { getScrollParent } from './scrollParent';
import { FullscreenContext } from '../../FullscreenButton/context';

export default function useScrollParent(ref: RefObject<HTMLElement>) {
  // A fullscreen toggle changes an ancestor's scroll container even when the
  // provider keeps exactly the same child elements (and memoized row props).
  useContext(FullscreenContext);
  const [parent, setParent] = useState<HTMLElement>();
  useLayoutEffect(() => {
    if (ref.current) setParent(getScrollParent(ref.current));
  });
  return parent;
}
