import React from 'react';
import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

const LanguageSvg = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='1em'
      height='1em'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      style={{ opacity: 1 }}
    >
      <path d='m5 8 6 6'></path>
      <path d='m4 14 6-6 3-3'></path>
      <path d='M2 5h12'></path>
      <path d='M7 2h1'></path>
      <path d='m22 22-5-10-5 10'></path>
      <path d='M14 18h6'></path>
    </svg>
  );
};

const LanguageIcon = (props: Partial<CustomIconComponentProps>) => <Icon component={LanguageSvg} {...props} />;

export default LanguageIcon;
