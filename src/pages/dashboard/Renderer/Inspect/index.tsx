import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Select, Tabs } from 'antd';
import { json } from '@codemirror/lang-json';
import { defaultHighlightStyle } from '@codemirror/highlight';
import { EditorView } from '@codemirror/view';
import CodeMirror from '@/components/CodeMirror';
import './style.less';

interface Props {
  query?: any[];
  values: any;
}

export default function index(props: Props) {
  const { t } = useTranslation('dashboard');
  const { query, values } = props;
  const multipleQuery = query && query?.length > 1;
  const [queryType, setQueryType] = useState<any>(query?.[0]?.type);
  const queryByType = _.find(query, { type: queryType });

  useEffect(() => {
    setQueryType(query?.[0]?.type);
  }, [JSON.stringify(query)]);

  return (
    <Tabs className='dashboard-detail-inspect'>
      <Tabs.TabPane tab={t('panel.inspect.query')} key='query'>
        {multipleQuery && (
          <Select
            style={{ width: '100%', marginBottom: 10 }}
            options={_.map(query, (item) => {
              return {
                label: item.type,
                value: item.type,
              };
            })}
            value={queryType}
            onChange={(val) => {
              setQueryType(val);
            }}
          />
        )}
        <div style={{ height: multipleQuery ? 'calc(100% - 42px)' : '100%' }}>
          <CodeMirror
            height='100%'
            basicSetup
            editable
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
            value={queryByType ? JSON.stringify(queryByType, null, 2) : ''}
          />
        </div>
      </Tabs.TabPane>
      <Tabs.TabPane tab={t('panel.inspect.json')} key='json'>
        <CodeMirror
          height='100%'
          basicSetup
          editable
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
          value={values ? JSON.stringify(values, null, 2) : ''}
        />
      </Tabs.TabPane>
    </Tabs>
  );
}
