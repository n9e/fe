import React, { useState, useEffect } from 'react';
import Markdown from '@/components/Markdown';
import { getInstructionsByName } from './services';

interface Props {
  name: string;
}

export default function Instructions(props: Props) {
  const { name } = props;
  const [data, setData] = useState<string>('');

  useEffect(() => {
    if (name) {
      getInstructionsByName(name).then((res) => {
        setData(res);
      });
    }
  }, [name]);

  return (
    <div>
      <Markdown content={data || 'No Data'}></Markdown>
    </div>
  );
}
