import React, { useState } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Space, Table, Tabs } from 'antd';
import { QuestionOutlined, CopyOutlined } from '@ant-design/icons';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';
import { json } from '@codemirror/lang-json';
import { defaultHighlightStyle } from '@codemirror/highlight';
import { copyToClipBoard } from '@/utils';
import { Field, getFieldLabel, getFieldValue } from './utils';
import { typeIconMap } from './FieldsSidebar/Field';
import { typeMap } from '../Elasticsearch/services';

interface Props {
  value: Record<string, any>;
  fieldConfig: any;
  fields: Field[];
}

export default function LogView(props: Props) {
  const { t } = useTranslation('explorer');
  const { value, fieldConfig, fields } = props;
  const [type, setType] = useState<string>('table');
  let jsonValue = '';
  try {
    jsonValue = JSON.stringify(value, null, 4);
  } catch (e) {
    console.error(e);
    jsonValue = '无法解析';
  }

  return (
    <Tabs
      activeKey={type}
      onChange={(val) => {
        setType(val);
      }}
      size='small'
      className='log-view-tabs'
      tabBarExtraContent={
        <Space
          onClick={() => {
            copyToClipBoard(jsonValue, t);
          }}
          style={{ cursor: 'pointer' }}
        >
          <CopyOutlined />
          {t('log.copyToClipboard')}
        </Space>
      }
    >
      <Tabs.TabPane tab='Table' key='table'>
        <Table
          dataSource={_.map(value, (val, key) => {
            return {
              field: key,
              value: val,
            };
          })}
          columns={[
            {
              title: 'Field',
              dataIndex: 'field',
              key: 'field',
              render: (text: string) => {
                const finded = _.find(fields, { name: text });
                return (
                  <Space>
                    <span className='es-discover-fields-item-icon'>{finded ? typeIconMap[typeMap[finded.type]] || <QuestionOutlined /> : <QuestionOutlined />}</span>
                    {getFieldLabel(text, fieldConfig)}
                  </Space>
                );
              },
            },
            {
              title: 'Value',
              dataIndex: 'value',
              key: 'value',
              render: (val: any, record: { field: string }) => {
                const field = record.field;
                const fieldVal = getFieldValue(field, val, fieldConfig);
                const value = _.isArray(fieldVal) ? _.join(fieldVal, ',') : fieldVal;
                return <div>{value}</div>;
              },
            },
          ]}
          size='small'
          pagination={false}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab='JSON' key='json'>
        <CodeMirror
          value={jsonValue}
          height='auto'
          theme='light'
          basicSetup={false}
          editable={false}
          extensions={[
            defaultHighlightStyle.fallback,
            json(),
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
      </Tabs.TabPane>
    </Tabs>
  );
}
