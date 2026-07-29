import React from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Form, Modal, Space } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { EditorView } from '@codemirror/view';
import CodeMirror from '@/components/CodeMirror';

import { NS, EVENT_DROP_SNIPPETS } from '../../../constants';

interface Props {
  field: FormListFieldData;
  namePath: (string | number)[];
  /** 从表单根到该处理器的路径，用于定位 content 字段；不传则退化成只读展示 */
  prefixNamePath?: (string | number)[];
}

export default function EventDrop(props: Props) {
  const { t } = useTranslation(NS);
  const { field, namePath = [], prefixNamePath = ['processors'] } = props;
  const resetField = _.omit(field, ['name', 'key']);
  const form = Form.useFormInstance();
  // Form.List 内部必须用「从表单根开始的绝对路径」才监听/写得到，相对路径拿不到值
  const contentPath = [...prefixNamePath, ...namePath, 'content'];
  const content = Form.useWatch(contentPath);

  const applySnippet = (snippet: string) => {
    const write = () => form.setFields([{ name: contentPath, value: snippet }]);
    // 不能追加：两段 {{if}} 都命中会输出 "truetrue"，后端判等 true 失败，
    // 表现成「配了丢弃却没丢」，比直接覆盖更难排查。所以非空时明确问一次。
    if (_.trim(content)) {
      Modal.confirm({ title: t('event_drop.replace_confirm'), onOk: write });
      return;
    }
    write();
  };

  return (
    <>
      <Form.Item {...resetField} label={t('event_drop.content')} name={[...namePath, 'content']} rules={[{ required: true }]} className='mb-2'>
        <CodeMirror
          height='200px'
          className='fc-border'
          basicSetup
          editable
          placeholder={t('event_drop.content_placeholder')}
          extensions={[
            EditorView.lineWrapping,
            EditorView.theme({
              '&': {
                backgroundColor: 'var(--fc-fill-2) !important',
              },
              '&.cm-editor.cm-focused': {
                outline: 'unset',
              },
            }),
          ]}
        />
      </Form.Item>
      {/* 说明常驻、不折进 ? tooltip：这是新人在这一屏必然会问的问题。
          示例片段全部在真实后端跑通过，见 EVENT_DROP_SNIPPETS 的注释。 */}
      <div className='mb-4'>
        <div className='text-soft text-[12px] mb-2'>{t('event_drop.hint')}</div>
        <Space size={[8, 4]} wrap>
          <span className='text-soft text-[12px]'>{t('event_drop.snippets_label')}</span>
          {_.map(EVENT_DROP_SNIPPETS, (snippet) => (
            <a key={snippet.key} className='text-[12px]' onClick={() => applySnippet(snippet.content)}>
              {t(`event_drop.snippets.${snippet.key}`)}
            </a>
          ))}
        </Space>
      </div>
    </>
  );
}
