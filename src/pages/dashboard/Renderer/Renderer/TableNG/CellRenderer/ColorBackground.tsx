import React from 'react';

import { TextObject } from './types';

interface Props {
  data: TextObject;
}

export default function ColorBackground(props: Props) {
  const { data } = props;

  return (
    <div
      style={{
        backgroundColor: data.color,
        color: '#FFFFFF',
      }}
      className='px-2'
    >
      {data.text}
    </div>
  );
}
