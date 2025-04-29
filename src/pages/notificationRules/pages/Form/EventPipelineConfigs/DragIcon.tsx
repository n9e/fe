import React from 'react';
import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

const DragSvg = () => (
  <svg viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='1668' width='1em' height='1em'>
    <path
      d='M288 192a96 96 0 1 1 0-192 96 96 0 0 1 0 192z m0 277.312a96 96 0 1 1 0-192 96 96 0 0 1 0 192z m0 277.376a96 96 0 1 1 0-192 96 96 0 0 1 0 192zM288 1024a96 96 0 1 1 0-192 96 96 0 0 1 0 192z m448-832a96 96 0 1 1 0-192 96 96 0 0 1 0 192z m0 277.312a96 96 0 1 1 0-192 96 96 0 0 1 0 192z m0 277.376a96 96 0 1 1 0-192 96 96 0 0 1 0 192z m0 277.312a96 96 0 1 1 0-192 96 96 0 0 1 0 192z'
      fill='#262626'
      p-id='1669'
    ></path>
  </svg>
);

const DragIcon = (props: Partial<CustomIconComponentProps>) => <Icon component={DragSvg} {...props} />;

export default DragIcon;
