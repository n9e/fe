import React from 'react';
import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

const UnorderedListSvg = () => (
  <svg width='1em' height='1em' viewBox='0 0 24 24' fill='currentColor'>
    <path d='M4 20h16c1.1 0 2-.9 2-2s-.9-2-2-2H4c-1.1 0-2 .9-2 2s.9 2 2 2zm0-3h2v2H4v-2zM2 6c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2s-.9-2-2-2H4c-1.1 0-2 .9-2 2zm4 1H4V5h2v2zm-2 7h16c1.1 0 2-.9 2-2s-.9-2-2-2H4c-1.1 0-2 .9-2 2s.9 2 2 2zm0-3h2v2H4v-2z'></path>
  </svg>
);

const UnorderedListIcon = (props: Partial<CustomIconComponentProps>) => <Icon component={UnorderedListSvg} {...props} />;

export default UnorderedListIcon;
