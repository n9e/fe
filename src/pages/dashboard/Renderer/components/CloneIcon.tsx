import React from 'react';
import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

const CloneSvg = () => (
  <svg viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' width='1em' height='1em'>
    <path
      fill='currentColor'
      d='M880 51.2c51.2 0 92.8 41.6 92.8 92.8v582.3c0 51.2-41.6 92.8-92.8 92.8-22.1 0-40-18-40-40s18-40 40-40c7 0 12.8-5.7 12.8-12.8V144c0-7-5.7-12.8-12.8-12.8H297.6c-7 0-12.8 5.7-12.8 12.8 0 22.1-17.9 40-40 40s-40-18-40-40c0-51.2 41.6-92.8 92.8-92.8H880zM707.3 328.6c0-6.6-5.4-12-12-12H139.9c-6.6 0-12 5.4-12 12v555.5c0 6.6 5.4 12 12 12h555.4c6.6 0 12-5.4 12-12V328.6z m-12-88.7c48.9 0 88.7 39.8 88.7 88.7v555.5c0 48.9-39.8 88.7-88.7 88.7H139.9c-48.9 0-88.7-39.8-88.7-88.7V328.6c0-48.9 39.8-88.7 88.7-88.7h555.4zM580.9 555.3c18.5 0 33.5 15 33.5 33.5s-15 33.5-33.5 33.5H468.7v112.2c0 18.5-15 33.5-33.4 33.5-18.6 0-33.5-15-33.5-33.5V622.3H289.5c-18.5 0-33.5-15-33.5-33.5s15-33.5 33.5-33.5h112.2V443.1c0-18.5 15-33.5 33.5-33.5s33.4 15 33.4 33.5v112.2h112.3z'
    ></path>
  </svg>
);

const CloneIcon = (props: Partial<CustomIconComponentProps>) => <Icon component={CloneSvg} {...props} />;

export default CloneIcon;
