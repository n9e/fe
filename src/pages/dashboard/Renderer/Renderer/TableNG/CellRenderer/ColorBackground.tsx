import React from 'react';
import classNames from 'classnames';

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
      className={classNames('px-2', {
        'text-white': data.color,
        'n9e-dashboard-panel-table-ng-cell-background': data.color,
      })}
    >
      {data.text}
    </div>
  );
}
