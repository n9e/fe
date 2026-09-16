import React from 'react';
import classNames from 'classnames';

import './style.less';

interface QueryBoxPrefixProps {
  /** Pinned inside the box at its left end; without it the box renders as it always did. */
  prefix?: React.ReactNode;
  /** The wrapped box, for callers that need to point at it. */
  boxRef?: React.Ref<HTMLDivElement>;
  children: React.ReactNode;
}

/**
 * Wraps a query box that has no prefix slot of its own and pins `prefix`
 * inside it at the left. Without a prefix the box is rendered bare, exactly
 * as the page had it.
 */
export default function QueryBoxPrefix({ prefix, boxRef, children }: QueryBoxPrefixProps) {
  if (!prefix) return <>{children}</>;
  return (
    <div className='relative' ref={boxRef}>
      {children}
      <span className='absolute left-2 top-0 z-10 flex h-8 items-center'>{prefix}</span>
    </div>
  );
}

interface QueryBoxColumnProps {
  /** The box inside has a prefix pinned in it: its text keeps clear of it. */
  prefixed?: boolean;
  /** Hangs right under the box, as wide as it (e.g. the AI dock). */
  below?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/**
 * The column a query box sits in once something is attached to it: a prefix
 * pinned inside, or something hanging under it. With neither, the box is
 * returned as is, so a page that attaches nothing keeps the markup it had.
 */
export function QueryBoxColumn({ prefixed, below, className, children }: QueryBoxColumnProps) {
  if (!prefixed && !below) return <>{children}</>;
  return (
    <div className={classNames(className, { 'query-box-prefix-column': prefixed })}>
      {children}
      {below}
    </div>
  );
}
