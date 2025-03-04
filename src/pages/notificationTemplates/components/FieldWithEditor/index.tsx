import React from 'react';
import CodeMirror from '@/components/CodeMirror';
import _ from 'lodash';

import './style.less';

interface IProps {
  label?: React.ReactNode;
  titleExtra?: React.ReactNode;
  value?: string;
  onChange?: (value?: string) => void;
  extensions: any[];
  previewResult?: React.ReactNode;
  scrolling?: boolean; // iframe 有自身的滚动条，不需要额外的滚动条
}

export const generateRules = (limitSize) => {
  return [
    {
      validator: (_field, value) => {
        if (_.size(value) > limitSize) {
          return Promise.reject(`配置不能超过 ${limitSize} 个字符`);
        }
        return Promise.resolve();
      },
    },
  ];
};

export default function FieldWithEditor(props: IProps) {
  const { label, titleExtra, value, onChange, extensions, previewResult, scrolling = true } = props;

  return (
    <div className='n9e-notification-template-content'>
      <div className='n9e-notification-template-content-editor'>
        <div className='n9e-notification-template-content-editor-header'>
          <div>{label}</div>
          <div>{titleExtra}</div>
        </div>
        {previewResult ? (
          <div
            className='template-field-preview'
            style={{
              overflowY: scrolling ? 'auto' : 'hidden',
            }}
          >
            {previewResult}
          </div>
        ) : (
          <CodeMirror value={value} height='100%' extensions={extensions} onChange={onChange} />
        )}
      </div>
    </div>
  );
}
