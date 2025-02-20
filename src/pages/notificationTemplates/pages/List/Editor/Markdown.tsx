import React from 'react';
import { markdown } from '@codemirror/lang-markdown';
import ReactMarkdown from 'react-markdown';
import _ from 'lodash';
import { Space } from 'antd';

import FieldWithEditor, { generateRules } from '../../../components/FieldWithEditor';

interface IProps {
  label: React.ReactNode;
  extra: React.ReactNode;
  value?: string;
  onChange?: (value?: string) => void;
}

const LIMIT_SIZE = 1000;

export const dingtalkRules = generateRules(LIMIT_SIZE);

export default function Dingtalk(props: IProps) {
  const { label, extra, value, onChange } = props;

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
      renderPreview={(newValue) => {
        return <ReactMarkdown>{newValue || ''}</ReactMarkdown>;
      }}
      limitSize={LIMIT_SIZE}
    />
  );
}
