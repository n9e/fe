import React from 'react';
import { Form, Input, InputNumber, Radio } from 'antd';
import { useTranslation } from 'react-i18next';
import { EditorView } from '@codemirror/view';

import CodeMirror from '@/components/CodeMirror';

import { NS } from '../../constants';

export default function Script() {
  const { t } = useTranslation(NS);
  const names = ['request_config', 'script_request_config'];
  const request_type = Form.useWatch('request_type');
  const script_type = Form.useWatch([...names, 'script_type']);
  const isRequired = request_type === 'script';

  return (
    <div
      style={{
        display: request_type === 'script' ? 'block' : 'none',
      }}
    >
      <Form.Item label={t('script_request_config.timeout')} name={[...names, 'timeout']}>
        <InputNumber style={{ width: '100%' }} min={0} />
      </Form.Item>
      <Form.Item name={[...names, 'script_type']}>
        <Radio.Group>
          <Radio value='script'>{t('script_request_config.script.option')}</Radio>
          <Radio value='path'>{t('script_request_config.path.option')}</Radio>
        </Radio.Group>
      </Form.Item>
      {script_type === 'script' && (
        <Form.Item label={t('script_request_config.script.label')} name={[...names, 'script']} rules={[{ required: isRequired }]}>
          <CodeMirror
            height='400px'
            className='n9e-border-base'
            basicSetup
            editable
            extensions={[
              EditorView.lineWrapping,
              EditorView.theme({
                '&': {
                  backgroundColor: '#F6F6F6 !important',
                },
                '&.cm-editor.cm-focused': {
                  outline: 'unset',
                },
              }),
            ]}
          />
        </Form.Item>
      )}
      {script_type === 'path' && (
        <Form.Item label={t('script_request_config.path.label')} name={[...names, 'path']} rules={[{ required: isRequired }]}>
          <Input placeholder='/opt/n9e/etc/scripts/notify.py' />
        </Form.Item>
      )}
    </div>
  );
}
