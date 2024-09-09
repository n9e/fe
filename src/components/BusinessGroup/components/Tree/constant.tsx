import React from 'react';
import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

const rightSVG = () => (
  <svg width='1em' height='1em' fill='currentColor' viewBox='0 0 24 24'>
    <path d='m14.471 11.529-3.333-3.334a.667.667 0 0 0-.943.943L13.057 12l-2.862 2.862a.668.668 0 0 0 .47 1.146.668.668 0 0 0 .473-.203l3.333-3.334a.666.666 0 0 0 0-.942Z'></path>
  </svg>
);

export const RightIcon = (props: Partial<CustomIconComponentProps>) => <Icon component={rightSVG} {...props} />;

const downSVG = () => (
  <svg width='1em' height='1em' fill='currentColor' viewBox='0 0 24 24'>
    <path d='M14.862 10.195 12 13.057l-2.862-2.862a.667.667 0 0 0-.943.943l3.334 3.333a.666.666 0 0 0 .942 0l3.334-3.333a.668.668 0 0 0-.47-1.146.667.667 0 0 0-.473.203Z'></path>
  </svg>
);

export const DownIcon = (props: Partial<CustomIconComponentProps>) => <Icon component={downSVG} {...props} />;
