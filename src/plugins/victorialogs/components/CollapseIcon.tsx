import React from 'react';
import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

const CollapseSvg = () => (
  <svg width='1em' height='1em' viewBox='0 0 24 24' fill='currentColor'>
    <path d='M7.41 18.59 8.83 20 12 16.83 15.17 20l1.41-1.41L12 14zm9.18-13.18L15.17 4 12 7.17 8.83 4 7.41 5.41 12 10z'></path>
  </svg>
);

const CollapseIcon = (props: Partial<CustomIconComponentProps>) => <Icon component={CollapseSvg} {...props} />;

export default CollapseIcon;
