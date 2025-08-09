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
      }}
      className='px-2 text-white n9e-dashboard-panel-table-ng-cell-background'
    >
      {data.text}
    </div>
  );
}
