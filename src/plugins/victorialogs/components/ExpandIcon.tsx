import React from 'react';
import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

const ExpandSvg = () => (
  <svg width='1em' height='1em' viewBox='0 0 24 24' fill='currentColor'>
    <path d='M12 5.83 15.17 9l1.41-1.41L12 3 7.41 7.59 8.83 9zm0 12.34L8.83 15l-1.41 1.41L12 21l4.59-4.59L15.17 15z'></path>
  </svg>
);

const ExpandIcon = (props: Partial<CustomIconComponentProps>) => <Icon component={ExpandSvg} {...props} />;

export default ExpandIcon;
