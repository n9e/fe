import React from 'react';
import _ from 'lodash';
import { Space } from 'antd';
import { useTranslation } from 'react-i18next';

import CodeMirror from '@/components/CodeMirror';
import { AiButton } from '@/components/AiChatNG/FlashAiButton';
import { getNotifyTplPrompts } from '@/components/AiChatNG/recommend';

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
  const { i18n } = useTranslation();
  const { label, titleExtra, value, onChange, extensions, previewResult, scrolling = true } = props;

  return (
    <div className='n9e-notification-template-content'>
      <div className='n9e-notification-template-content-editor'>
        <div className='n9e-notification-template-content-editor-header'>
          <div>
            <div className='flex items-center gap-2'>
              {label}
              <AiButton
                size='small'
                queryAction={{
                  key: 'notify_template_generator',
                }}
                promptList={getNotifyTplPrompts(i18n.language)}
              />
            </div>
          </div>
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
