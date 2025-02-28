import React from 'react';
import purify from 'dompurify';
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

export const htmlRules = generateRules(LIMIT_SIZE);

export default function HTML(props: IProps) {
  const { label, extra, value, onChange, previewResultStr } = props;

  return (
    <FieldWithEditor
      label={label}
      titleExtra={
        <Space>
          <span>Text</span>
          {extra}
        </Space>
      }
      value={value}
      onChange={onChange}
      extensions={[]}
      previewResult={previewResultStr ? <iframe srcDoc={purify.sanitize(previewResultStr, { FORCE_BODY: true })} style={{ border: 'none', width: '100%' }} /> : undefined}
      scrolling={false}
    />
  );
}
