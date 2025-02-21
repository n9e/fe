import React from 'react';
import { markdown } from '@codemirror/lang-markdown';
import ReactMarkdown from 'react-markdown';
import _ from 'lodash';
import { Space } from 'antd';

import FieldWithEditor, { generateRules } from '../../../components/FieldWithEditor';

interface IProps {
  label?: React.ReactNode;
  extra?: React.ReactNode;
  value?: string;
  onChange?: (value?: string) => void;
  previewResultStr?: string;
}

const LIMIT_SIZE = 1000;

export const markdownRules = generateRules(LIMIT_SIZE);

export default function Markdown(props: IProps) {
  const { label, extra, value, onChange, previewResultStr } = props;

  return (
    <FieldWithEditor
      label={label}
      titleExtra={
        <Space>
          <span>Markdown</span>
          {extra}
        </Space>
      }
      value={value}
      onChange={onChange}
      extensions={[markdown()]}
      previewResult={previewResultStr ? <ReactMarkdown>{previewResultStr}</ReactMarkdown> : undefined}
    />
  );
}
