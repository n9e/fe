import React, { useContext } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { CommonStateContext } from '@/App';

interface Props {
  readme?: string;
}

const Markdown = MDEditor.Markdown as any;

export default function Instructions(props: Props) {
  const { darkMode } = useContext(CommonStateContext);
  const { readme } = props;

  return (
    <div className='builtin-w-md-editor' data-color-mode={darkMode ? 'dark' : 'light'}>
      <Markdown source={readme} />
    </div>
  );
}
