import React from 'react';
import purify from 'dompurify';
import { html } from '@codemirror/lang-html';
import _ from 'lodash';
import FieldWithEditor, { generateRules } from './components/FieldWithEditor';

interface IProps {
  value?: string;
  onChange?: (value?: string) => void;
  record?: any;
}

const LIMIT_SIZE = 1000;

export const emailRules = generateRules(LIMIT_SIZE);

export default function Email(props: IProps) {
  const { value, onChange, record } = props;

  return (
    <FieldWithEditor
      value={value}
      onChange={onChange}
      record={record}
      extensions={[html()]}
      renderPreview={(newValue) => {
        return <iframe srcDoc={purify.sanitize(newValue, { FORCE_BODY: true })} style={{ border: 'none', width: '100%' }} />;
      }}
      limitSize={LIMIT_SIZE}
      titleExtra='HTML'
    />
  );
}
