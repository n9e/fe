import React, { useEffect } from 'react';
import _ from 'lodash';
import { Modal, Form, Select, Input, Space, message } from 'antd';
import { useTranslation } from 'react-i18next';
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/stream-parser';
import { toml } from '@codemirror/legacy-modes/mode/toml';
import { json } from '@codemirror/legacy-modes/mode/javascript';
import { EditorView } from '@codemirror/view';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { postPayloads, putPayload } from '../../services';

interface Props {
  darkMode: boolean;
  action: 'create' | 'edit';
  cateList: string[];
  initialValues?: any;
  contentMode: 'json' | 'yaml';
  onOk: (values: any) => void;
}

function index(props: Props & ModalWrapProps) {
  const { t } = useTranslation('builtInComponents');
  const { darkMode, action, cateList, initialValues, contentMode, onOk, visible, destroy } = props;
  const [form] = Form.useForm();

  useEffect(() => {
    const values: any = {
      cate: _.head(cateList),
    };
    if (action === 'edit' && !_.isEmpty(initialValues)) {
      try {
        values.content = contentMode === 'json' ? JSON.stringify(JSON.parse(form.getFieldValue('content')), null, 4) : initialValues.content;
      } catch (e) {
        console.error(e);
      }
    }
    form.setFieldsValue(values);
  }, []);

  console.log(initialValues, contentMode);

  return (
    <Modal
      width={800}
      title={t(`formModal.${action}`)}
      visible={visible}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            if (action === 'edit') {
              putPayload(values).then(() => {
                message.success(t('common:success.modify'));
                destroy();
                onOk(values);
              });
            } else if (action === 'create') {
              postPayloads([values]).then((res) => {
                if (_.isEmpty(res)) {
                  message.success(t('common:success.create'));
                  destroy();
                  onOk(values);
                } else {
                  let msg = '';
                  _.forEach(res, (v, k) => {
                    msg += `${k}: ${v}; `;
                  });
                  message.error(msg);
                }
              });
            }
          })
          .catch((e) => {
            console.error(e);
          });
      }}
      onCancel={() => {
        destroy();
      }}
    >
      <Form form={form} initialValues={initialValues} layout='vertical'>
        <Form.Item name='id' hidden>
          <div />
        </Form.Item>
        <Form.Item name='type' hidden>
          <div />
        </Form.Item>
        <Form.Item name='component' hidden>
          <div />
        </Form.Item>
        <Form.Item
          label={t('name')}
          name='name'
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>
        {_.isEmpty(cateList) ? null : (
          <Form.Item
            label={t('cate')}
            name='cate'
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Select>
              {_.map(cateList, (item) => (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {contentMode === 'json' ? (
          <Form.Item
            label={
              <Space>
                {t('content')}
                <a
                  onClick={() => {
                    try {
                      form.setFieldsValue({
                        content: JSON.stringify(JSON.parse(form.getFieldValue('content')), null, 4),
                      });
                    } catch (e) {
                      message.error(t('format_failed'));
                      console.error(e);
                    }
                  }}
                >
                  {t('format')}
                </a>
              </Space>
            }
            name='content'
            rules={[
              {
                required: true,
              },
            ]}
          >
            <CodeMirror
              theme={darkMode ? 'dark' : 'light'}
              className='n9e-border-base n9e-border-radius-base'
              height='300px'
              basicSetup
              editable
              extensions={[
                StreamLanguage.define(json),
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
        ) : (
          <Form.Item
            label={t('content')}
            name='content'
            rules={[
              {
                required: true,
              },
            ]}
          >
            <CodeMirror
              theme={darkMode ? 'dark' : 'light'}
              className='n9e-border-base n9e-border-radius-base'
              height='300px'
              basicSetup
              editable
              extensions={[
                StreamLanguage.define(toml),
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
      </Form>
    </Modal>
  );
}

export default ModalHOC<Props>(index);
