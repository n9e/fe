import React, { useState } from 'react';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import CodeMirror from '@uiw/react-codemirror';
import _ from 'lodash';
import { previewTemplate } from '../../../services';
import './style.less';

interface IProps {
  value?: string;
  onChange?: (value?: string) => void;
  extensions: any[];
  renderPreview?: (value?: string) => React.ReactNode;
  limitSize: number;
  titleExtra?: React.ReactNode;
  record?: any;
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
  const { value, onChange, extensions, renderPreview, titleExtra, record } = props;
  const [previewResult, setPreviewResult] =
    useState<{
      content: string;
      success: boolean;
      message: string;
    }>();
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);

  return (
    <div className='template-field'>
      <div className='template-field-editor'>
        <div className='template-field-editor-header'>
          <div>
            <span>{titleExtra}</span>
          </div>
          {renderPreview && value && (
            <div
              className='cursor-pointer'
              onClick={() => {
                if (!previewResult) {
                  setPreviewLoading(true);
                  previewTemplate(record)
                    .then((res) => {
                      setPreviewResult({
                        content: res,
                        success: true,
                        message: '',
                      });
                    })
                    .finally(() => {
                      setPreviewLoading(false);
                    });
                } else {
                  setPreviewResult(undefined);
                }
              }}
            >
              {previewResult ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </div>
          )}
        </div>
        {previewResult ? (
          <div className='template-field-preview'>
            {previewResult?.success ? <>{renderPreview && renderPreview(previewResult?.content)}</> : <div className='text-error-color'>{previewResult?.message}</div>}
          </div>
        ) : (
          <CodeMirror value={value} height='100%' extensions={extensions} onChange={onChange} />
        )}
      </div>
    </div>
  );
}
