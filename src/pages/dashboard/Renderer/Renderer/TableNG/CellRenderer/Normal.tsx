import React from 'react';

import { CellOptions } from '@/pages/dashboard/types';

import { TextObject } from './types';

interface Props {
  data: TextObject;
  cellOptions: CellOptions;
}

export default function Normal(props: Props) {
  const { data, cellOptions } = props;

  return <div className={`px-2 ${cellOptions.wrapText} ? 'py-1' : ''`}>{data.text}</div>;
}
