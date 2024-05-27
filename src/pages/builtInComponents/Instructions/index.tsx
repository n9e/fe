import React, { useContext } from 'react';
import _ from 'lodash';
import MDEditor from '@uiw/react-md-editor';
import { CommonStateContext } from '@/App';

interface Props {
  readme?: string;
}

export default function Instructions(props: Props) {
  const { darkMode } = useContext(CommonStateContext);
  const { readme } = props;

  return (
    <div className='builtin-w-md-editor' data-color-mode={darkMode ? 'dark' : 'light'}>
      <MDEditor.Markdown
        source={readme}
        rehypeRewrite={(node: any) => {
          if (_.includes(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], node.tagName)) {
            node.children = node.children.filter((item) => item.tagName != 'a');
          }
        }}
      />
    </div>
  );
}
