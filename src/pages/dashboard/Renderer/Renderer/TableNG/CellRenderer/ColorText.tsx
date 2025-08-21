import React from 'react';

import { CellOptions } from '@/pages/dashboard/types';

import { TextObject } from './types';

interface Props {
  data: TextObject;
  cellOptions: CellOptions;
}

export default function ColorText(props: Props) {
  const { data, cellOptions } = props;

  return (
    <div
      style={{
        color: data.color,
      }}
      className={`px-2 ${cellOptions.wrapText ? 'py-1' : ''}`}
    >
      {data.text}
    </div>
  );
}
