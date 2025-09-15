import React from 'react';

/** 上升Icon */
export function DownIcon(props: { className?: string }) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 48 48' className={props.className}>
      <path strokeLinejoin='round' strokeLinecap='round' strokeWidth='4' stroke='currentColor' d='M29 35h12V23' />
      <path strokeLinejoin='round' strokeLinecap='round' strokeWidth='4' stroke='currentColor' d='m6 13 10.338 12.5 9.847-6L41 35' />
    </svg>
  );
}
/** 上升Icon */
export function UpIcon(props: { className?: string }) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 48 48' className={props.className}>
      <path strokeLinejoin='round' strokeLinecap='round' strokeWidth='4' stroke='currentColor' d='M41 27V15H29' />
      <path strokeLinejoin='round' strokeLinecap='round' strokeWidth='4' stroke='currentColor' d='m6 37 10.338-12.5 9.847 6L41 15' />
    </svg>
  );
}
