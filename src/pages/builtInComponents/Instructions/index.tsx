import React, { useContext } from 'react';
import _ from 'lodash';
import MDEditor from '@uiw/react-md-editor';
import { CommonStateContext } from '@/App';

interface Props {
  value?: string;
  onChange: (value: string) => void;
  editabled: boolean;
  setReadmeEditabled: (editabled: boolean) => void;
}

export default function Instructions(props: Props) {
  const { darkMode } = useContext(CommonStateContext);
  const { value, onChange, editabled, setReadmeEditabled } = props;

  return (
    <div className='builtin-w-md-editor' data-color-mode={darkMode ? 'dark' : 'light'}>
      {editabled ? (
        <MDEditor
          height='100%'
          value={value}
          onChange={(newValue) => {
            onChange(newValue || '');
          }}
        />
      ) : (
        <MDEditor.Markdown
          source={value}
          rehypeRewrite={(node: any) => {
            if (_.includes(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], node.tagName)) {
              node.children = node.children.filter((item) => item.tagName != 'a');
            }
          }}
        />
      )}
    </div>
  );
}
