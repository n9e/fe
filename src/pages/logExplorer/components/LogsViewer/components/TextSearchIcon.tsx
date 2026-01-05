import React from 'react';
import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

const TextSearchSvg = () => (
  <svg width='1em' height='1em' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path d='M10 18C10.5523 18 11 18.4477 11 19C11 19.5523 10.5523 20 10 20H3C2.44772 20 2 19.5523 2 19C2 18.4477 2.44772 18 3 18H10Z' fill='currentColor' />
    <path
      fill-rule='evenodd'
      clip-rule='evenodd'
      d='M17 11C19.2091 11 21 12.7909 21 15C21 15.7417 20.7971 16.4358 20.4453 17.0312L21.707 18.293C22.0972 18.6835 22.0974 19.3166 21.707 19.707C21.3166 20.0974 20.6835 20.0972 20.293 19.707L19.0312 18.4453C18.4358 18.7971 17.7417 19 17 19C14.7909 19 13 17.2091 13 15C13 12.7909 14.7909 11 17 11ZM17 13C15.8954 13 15 13.8954 15 15C15 16.1046 15.8954 17 17 17C17.4806 17 17.9207 16.8294 18.2656 16.5469C18.3019 16.4923 18.3445 16.4407 18.3926 16.3926C18.4407 16.3445 18.4923 16.3019 18.5469 16.2656C18.8294 15.9207 19 15.4806 19 15C19 13.8954 18.1046 13 17 13Z'
      fill='black'
    />
    <path d='M10 11C10.5523 11 11 11.4477 11 12C11 12.5523 10.5523 13 10 13H3C2.44772 13 2 12.5523 2 12C2 11.4477 2.44772 11 3 11H10Z' fill='currentColor' />
    <path d='M21 4C21.5523 4 22 4.44772 22 5C22 5.55228 21.5523 6 21 6H3C2.44772 6 2 5.55228 2 5C2 4.44772 2.44772 4 3 4H21Z' fill='currentColor' />
  </svg>
);

const TextSearchIcon = (props: Partial<CustomIconComponentProps>) => <Icon component={TextSearchSvg} {...props} />;

export default TextSearchIcon;
