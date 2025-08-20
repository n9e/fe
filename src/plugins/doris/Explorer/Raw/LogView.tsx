import React, { useState, useMemo } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Space, Table, Tabs } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import CodeMirror from '@/components/CodeMirror';
import { EditorView } from '@codemirror/view';
import { json } from '@codemirror/lang-json';
import { defaultHighlightStyle } from '@codemirror/highlight';
import { copyToClipBoard } from '@/utils';
import { FieldValueWithFilter } from './RawList';

interface Props {
  value: Record<string, any>;
  onValueFilter: (parmas: { key: string; value: string; operator: 'AND' | 'NOT' }) => void;
}

export default function LogView(props: Props) {
  const { t } = useTranslation('explorer');
  const { value, onValueFilter } = props;
  const [type, setType] = useState<string>('table');
  const data = useMemo(
    () =>
      _.map(_.omit(value, ['___id___']), (val, key) => {
        return {
          field: key,
          value: val,
        };
      }),
    [],
  );
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
      // className='log-view-tabs'
      tabBarExtraContent={
        <Space
          onClick={() => {
            copyToClipBoard(jsonValue);
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
          showHeader={false}
          dataSource={data}
          columns={[
            {
              title: 'Field',
              dataIndex: 'field',
              key: 'field',
            },
            {
              title: 'Value',
              dataIndex: 'value',
              key: 'value',
              render: (val, record) => {
                return <FieldValueWithFilter name={record.field} value={val} onValueFilter={onValueFilter} />;
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
          basicSetup={false}
          editable={false}
          extensions={[
            defaultHighlightStyle.fallback,
            json(),
            EditorView.lineWrapping,
            EditorView.theme({
              '&': {
                backgroundColor: '#FFF !important',
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
