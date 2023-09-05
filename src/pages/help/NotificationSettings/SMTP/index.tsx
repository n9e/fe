import React, { useEffect, useState } from 'react';
import { Form, Button, message, Space, Popover, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { getNotifyConfig, putNotifyConfig, smtpConfigTest } from '../services';

export default function index() {
  const [form] = Form.useForm();
  const { t } = useTranslation('notificationSettings');
  const [email, setEmail] = useState('');
  const [testPopoverVisible, setTestPopoverVisible] = useState(false);

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
          <Space>
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
            <Popover
              trigger={['click']}
              visible={testPopoverVisible}
              onVisibleChange={(visible) => {
                setTestPopoverVisible(visible);
              }}
              content={
                <Space>
                  <Input
                    placeholder='Email'
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                  />
                  <Button
                    type='primary'
                    onClick={() => {
                      form.validateFields().then((values) => {
                        smtpConfigTest({
                          ...values,
                          email,
                        }).then((res) => {
                          message.success(t('smtp.testMessage'));
                          setTestPopoverVisible(false);
                        });
                      });
                    }}
                  >
                    {t('common:btn.ok')}
                  </Button>
                </Space>
              }
            >
              <Button
                onClick={() => {
                  setTestPopoverVisible(true);
                }}
              >
                {t('common:btn.test')}
              </Button>
            </Popover>
          </Space>
        </div>
      </Form>
    </div>
  );
}
