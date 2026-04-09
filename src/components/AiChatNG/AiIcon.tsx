import React from 'react';
import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

const AiSvg = () => (
  <svg viewBox='0 0 24 24' fill='currentColor' width='1em' height='1em'>
    <path d='M10 2L12.4 8.2L19 10L12.4 11.8L10 18L7.6 11.8L1 10L7.6 8.2L10 2Z'></path>
    <path d='M18 14L19.2 17.2L22.5 18L19.2 18.8L18 22L16.8 18.8L13.5 18L16.8 17.2L18 14Z'></path>
  </svg>
);

const AiIcon = (props: Partial<CustomIconComponentProps>) => <Icon component={AiSvg} {...props} />;

export default AiIcon;
