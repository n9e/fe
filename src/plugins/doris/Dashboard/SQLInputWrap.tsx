import React, { useContext, useState } from 'react';
import { SqlMonacoEditor } from '@fc-components/monaco-editor';

import { CommonStateContext } from '@/App';

interface Props {
  placeholder: string;
  validateBeforeChange: (val: string) => boolean;

  value?: string;
  onChange?: (val: string) => void;
}

export default function SQLInputWrap(props: Props) {
  const { darkMode } = useContext(CommonStateContext);

  const { placeholder, validateBeforeChange, onChange } = props;

  const [value, setValue] = useState<string>(props.value || '');

  return (
    <SqlMonacoEditor
      maxHeight={200}
      theme={darkMode ? 'dark' : 'light'}
      enableAutocomplete={true}
      placeholder={placeholder}
      value={value}
      onChange={(val) => {
        setValue(val);
      }}
      onEnter={(val) => {
        if (validateBeforeChange(val)) {
          onChange?.(val);
        }
      }}
      onBlur={(val) => {
        if (validateBeforeChange(val)) {
          onChange?.(val);
        }
      }}
    />
  );
}
