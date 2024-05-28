import React, { useEffect } from 'react';
import _ from 'lodash';
import { Modal, Form, Select, Input, Space, message, AutoComplete } from 'antd';
import { useTranslation } from 'react-i18next';
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/stream-parser';
import { toml } from '@codemirror/legacy-modes/mode/toml';
import { json } from '@codemirror/legacy-modes/mode/javascript';
import { EditorView } from '@codemirror/view';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import KVTagSelect, { validatorOfKVTagSelect } from '@/components/KVTagSelect';
import { postPayloads, putPayload } from '../../services';
import { tags } from '@codemirror/highlight';

interface Props {
  darkMode: boolean;
  action: 'create' | 'edit';
  cateList: string[];
  initialValues?: any;
  contentMode: 'json' | 'yaml';
  showCate?: boolean;
  showTags?: boolean;
  onOk: (values: any) => void;
}

function index(props: Props & ModalWrapProps) {
  const { t } = useTranslation('builtInComponents');
  const { darkMode, action, cateList, initialValues, contentMode, showCate, showTags, onOk, visible, destroy } = props;
  const [form] = Form.useForm();

  useEffect(() => {
    const values: any = {
      cate: initialValues.cate || _.head(cateList),
      tags: initialValues.tags ? _.split(initialValues.tags, ' ') : [],
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

  return (
    <Modal
      width={800}
      title={t(`formModal.${action}`)}
      visible={visible}
      onOk={() => {
        form
          .validateFields()
          .then((values) => {
            values.tags = _.isArray(values.tags) ? _.join(values.tags, ' ') : _.toString(values.tags);
            // 可能粘贴进来的是数组，这里只取第一个
            try {
              if (contentMode === 'json') {
                const contentArr = JSON.parse(values.content);
                if (_.isArray(contentArr)) {
                  values.content = JSON.stringify(contentArr[0]);
                }
              }
            } catch (e) {
              message.error(t('format_failed'));
              console.error(e);
              return;
            }
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
        {showCate && (
          <Form.Item
            label={t('cate')}
            name='cate'
            rules={[
              {
                required: true,
              },
            ]}
          >
            <AutoComplete
              options={_.map(cateList, (item) => {
                return { value: item };
              })}
            />
          </Form.Item>
        )}
        {showTags && (
          <Form.Item label={t('common:table.tag')} name='tags'>
            <Select mode='tags' open={false} tokenSeparators={[' ']} placeholder={t('tags_placeholder')} />
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
