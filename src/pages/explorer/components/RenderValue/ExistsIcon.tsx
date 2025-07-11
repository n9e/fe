import React from 'react';
import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

const ExistsSvg = () => (
  <svg width='1em' height='1em' viewBox='0 0 16 16' focusable='false' role='img' aria-hidden='true' fill='currentColor'>
    <path d='M7.999 15.999a8 8 0 110-16 8 8 0 010 16zM8 15A7 7 0 108 1a7 7 0 000 14zM3.5 5h9a.5.5 0 110 1h-9a.5.5 0 010-1zm2 3h5a.5.5 0 110 1h-5a.5.5 0 010-1zm2 3h1a.5.5 0 110 1h-1a.5.5 0 110-1z'></path>
  </svg>
);

export default function ExistsIcon(props: Partial<CustomIconComponentProps>) {
  return <Icon component={ExistsSvg} {...props} />;
}
