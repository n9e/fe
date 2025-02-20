import React from 'react';
import purify from 'dompurify';
import { html } from '@codemirror/lang-html';
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

export const emailRules = generateRules(LIMIT_SIZE);

export default function Email(props: IProps) {
  const { label, extra, value, onChange } = props;

  return (
    <FieldWithEditor
      label={label}
      titleExtra={
        <Space>
          <span>HTML</span>
          {extra}
        </Space>
      }
      value={value}
      onChange={onChange}
      extensions={[html()]}
      renderPreview={(newValue) => {
        return <iframe srcDoc={purify.sanitize(newValue, { FORCE_BODY: true })} style={{ border: 'none', width: '100%' }} />;
      }}
      limitSize={LIMIT_SIZE}
    />
  );
}
