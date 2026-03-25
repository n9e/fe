import React from 'react';
import { IMessageResponse } from '../../store';

interface IPorps {
  response: IMessageResponse;
}

export default function HintContainer(props: IPorps) {
  const { response } = props;
  return (
    <>
      <div className='hint-text-box'>
        <div className='hint-message-title'>{response?.hint_text}</div>
      </div>
    </>
  );
}
