import React from 'react';

import { TextObject } from './types';

interface Props {
  data: TextObject;
}

export default function ColorText(props: Props) {
  const { data } = props;

  return (
    <div
      style={{
        color: data.color,
      }}
      className='px-2'
    >
      {data.text}
    </div>
  );
}
