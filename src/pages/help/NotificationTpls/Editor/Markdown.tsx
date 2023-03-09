import React from 'react';
import { markdown } from '@codemirror/lang-markdown';
import ReactMarkdown from 'react-markdown';
import _ from 'lodash';
import FieldWithEditor, { generateRules } from './components/FieldWithEditor';

interface IProps {
  value?: string;
  onChange?: (value?: string) => void;
  record?: any;
}

const LIMIT_SIZE = 1000;

export const dingtalkRules = generateRules(LIMIT_SIZE);

export default function Dingtalk(props: IProps) {
  const { value, onChange, record } = props;

  return (
    <FieldWithEditor
      value={value}
      onChange={onChange}
      record={record}
      extensions={[markdown()]}
      renderPreview={(newValue) => {
        return <ReactMarkdown>{newValue || ''}</ReactMarkdown>;
      }}
      limitSize={LIMIT_SIZE}
      titleExtra='Markdown'
    />
  );
}
