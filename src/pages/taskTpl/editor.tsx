/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useContext } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-sh';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-kuroir';
import { CommonStateContext } from '@/App';

interface Props {
  height: string;
  readOnly: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export default function Editor(props: Props) {
  const { darkMode } = useContext(CommonStateContext);
  return (
    <AceEditor
      placeholder='Placeholder Text'
      style={{ width: '100%' }}
      height={props.height}
      mode='sh'
      theme={darkMode ? 'monokai' : 'kuroir'}
      name='blah2'
      fontSize={14}
      showPrintMargin={false}
      showGutter
      readOnly={props.readOnly}
      highlightActiveLine
      setOptions={{
        enableBasicAutocompletion: true,
        enableLiveAutocompletion: true,
        enableSnippets: true,
        showLineNumbers: true,
        tabSize: 2,
      }}
      value={props.value}
      onChange={(newValue) => {
        if (props.onChange) {
          props.onChange(newValue);
        }
      }}
    />
  );
}

Editor.defaultProps = {
  readOnly: false,
  height: '500px',
};
