import React, { useContext } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { CommonStateContext } from '@/App';

export default function index(props) {
  const { darkMode } = useContext(CommonStateContext);

  return <CodeMirror theme={darkMode ? 'dark' : 'light'} {...props} />;
}
