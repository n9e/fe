import React from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Form } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { EditorView } from '@codemirror/view';
import CodeMirror from '@/components/CodeMirror';

import { NS } from '../../../constants';

interface Props {
  field: FormListFieldData;
  namePath: (string | number)[];
}

export default function Callback(props: Props) {
  const { t } = useTranslation(NS);
  const { field, namePath = [] } = props;
  const resetField = _.omit(field, ['name', 'key']);

  return (
    <>
      <Form.Item {...resetField} label={t('event_drop.content')} tooltip={t('event_drop.content_placeholder')} name={[...namePath, 'content']} rules={[{ required: true }]}>
        <CodeMirror
          height='200px'
          className='n9e-border-base'
          basicSetup
          editable
          placeholder={t('event_drop.content_placeholder')}
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
    </>
  );
}
