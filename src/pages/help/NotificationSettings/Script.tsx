import React, { useEffect } from 'react';
import _ from 'lodash';
import { Form, Input, InputNumber, Switch, Radio, Space, Button, message } from 'antd';
import { useTranslation } from 'react-i18next';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { getNotifyScript, putNotifyScript } from './services';

export default function Script() {
  const [form] = Form.useForm();
  const { t } = useTranslation('notificationSettings');

  useEffect(() => {
    getNotifyScript().then((res) => {
      form.setFieldsValue(res);
    });
  }, []);

  return (
    <div>
      <Form form={form} layout='vertical'>
        <div style={{ marginBottom: 10 }}>
          <Space align='baseline'>
            {t('script.enable')}
            <Form.Item name='enable' noStyle valuePropName='checked'>
              <Switch />
            </Form.Item>
          </Space>
        </div>
        <Form.Item label={t('script.timeout')} name='timeout'>
          <InputNumber style={{ width: '100%' }} defaultValue={5} />
        </Form.Item>
        <Form.Item name='type'>
          <Radio.Group optionType='button'>
            <Radio value={0}>{t('script.type.0')}</Radio>
            <Radio value={1}>{t('script.type.1')}</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item shouldUpdate noStyle>
          {() => {
            const type = form.getFieldValue('type');
            if (type === 0) {
              return (
                <Form.Item label={t('script.content')} name='content'>
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
              );
            }
            if (type === 1) {
              return (
                <>
                  <Form.Item label={t('script.path')} name='content'>
                    <Input />
                  </Form.Item>
                </>
              );
            }
          }}
        </Form.Item>
        <div>
          <Button
            type='primary'
            onClick={() => {
              form.validateFields().then((values) => {
                putNotifyScript(values).then(() => {
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
