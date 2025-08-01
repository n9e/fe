import React from 'react';

import { TextObject } from './types';

interface Props {
  data: TextObject;
}

export default function Normal(props: Props) {
  const { data } = props;

  return <div className='px-2'>{data.text}</div>;
}
