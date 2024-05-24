import React from 'react';
import Markdown from '@/components/Markdown';

interface Props {
  readme?: string;
}

export default function Instructions(props: Props) {
  const { readme } = props;

  return (
    <div>
      <Markdown content={readme || 'No Data'}></Markdown>
    </div>
  );
}
