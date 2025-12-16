import React from 'react';
import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';

const PinSvg = () => (
  <svg width='1em' height='1em' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <path
      fill='currentColor'
      d='M7.084 11.457C5.782 12.325 5 12.709 5 14.274V15h7v7l.5 1 .5-1v-7h7v-.726c0-1.565-.782-1.95-2.084-2.817l-1.147-.765L15 4l1.522-.43A2.029 2.029 0 0 0 18 1.619V1H7v.618A2.029 2.029 0 0 0 8.478 3.57L10 4l-1.77 6.692zM16.93 12l.73.485c1 .659 1.28.866 1.332 1.515H6.009c.051-.65.332-.856 1.333-1.515L8.07 12zM8.75 2.608A1.033 1.033 0 0 1 8.075 2h8.852a1.033 1.033 0 0 1-.676.608L14.862 3h-4.724zM11.035 4h2.931l1.85 7h-6.63z'
    />
  </svg>
);

const PinIcon = (props: Partial<CustomIconComponentProps>) => <Icon component={PinSvg} {...props} />;

const UnPinSvg = () => (
  <svg width='1em' height='1em' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <path
      fill='currentColor'
      d='M20 14.274V15h-7v7l-.5 1-.5-1v-6.172L13.828 14h5.163c-.051-.65-.332-.856-1.333-1.515L16.93 12h-1.1l1.16-1.161.927.618c1.302.868 2.084 1.252 2.084 2.817zm2.4-10.966L3.307 22.399l-.707-.707L9.293 15H5v-.726c0-1.565.782-1.95 2.084-2.817l1.147-.765L10 4l-1.522-.43A2.029 2.029 0 0 1 7 1.619V1h11v.618a2.029 2.029 0 0 1-1.478 1.953L15 4l1.107 4.186L21.692 2.6zM10.137 3h4.724l1.388-.392A1.033 1.033 0 0 0 16.926 2H8.074a1.033 1.033 0 0 0 .676.608zm-.954 8h4.109l1.995-1.995L13.966 4h-2.931zm1.109 3l2-2H8.07l-.73.485c-1 .659-1.28.866-1.332 1.515z'
    />
  </svg>
);

const UnPinIcon = (props: Partial<CustomIconComponentProps>) => <Icon component={UnPinSvg} {...props} />;

export { PinIcon, UnPinIcon };
