import React, { useEffect } from 'react';
import { Form, Button, message } from 'antd';
import { useTranslation } from 'react-i18next';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { getNotifyConfig, putNotifyConfig } from '../services';

export default function index() {
  const [form] = Form.useForm();
  const { t } = useTranslation('notificationSettings');

  useEffect(() => {
    getNotifyConfig('smtp_config').then((res) => {
      form.setFieldsValue({
        ckey: 'smtp_config',
        cval: res,
      });
    });
  }, []);

  return (
    <div>
      <Form form={form} layout='vertical'>
        <Form.Item name='ckey' hidden>
          <div />
        </Form.Item>
        <Form.Item name='cval'>
          <CodeMirror
            height='400px'
            theme='light'
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
        <div>
          <Button
            type='primary'
            onClick={() => {
              form.validateFields().then((values) => {
                putNotifyConfig(values).then(() => {
                  message.success(t('common:success.save'));
                });
              });
            }}
          >
            {t('common:btn.save')}
          </Button>
        </div>
      </Form>
    </div>
  );
}
