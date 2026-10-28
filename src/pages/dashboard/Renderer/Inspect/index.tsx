import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Alert, Select, Tabs } from 'antd';
import { json } from '@codemirror/lang-json';
import { defaultHighlightStyle } from '@codemirror/highlight';
import { EditorView } from '@codemirror/view';
import CodeMirror from '@/components/CodeMirror';
import type { IPanel, JsonValue } from '@/pages/dashboard/types';
import type { DashboardInspectQuery } from '../datasource/types';
import './style.less';

interface Props {
  query?: DashboardInspectQuery[];
  /** 查询在请求前失败时没有响应快照，直接展示当前面板报告的错误。 */
  error?: string;
  /** 请求尚未发送时提供的客户端请求参考，不代表已发送的实际请求。 */
  requestReference?: unknown;
  values: IPanel | JsonValue;
}

export default function index(props: Props) {
  const { t } = useTranslation('dashboard');
  const { query, error, requestReference, values } = props;
  const hasQuerySnapshot = Boolean(query?.length);
  const multipleQuery = query && query?.length > 1;
  const [queryType, setQueryType] = useState<string | undefined>(query?.[0]?.type);
  const queryByType = _.find(query, { type: queryType });

  useEffect(() => {
    setQueryType(query?.[0]?.type);
  }, [query]);

  return (
    <Tabs className='dashboard-detail-inspect'>
      <Tabs.TabPane tab={t('panel.inspect.query')} key='query'>
        <>
          {!hasQuerySnapshot && error ? (
            <Alert type='error' showIcon message={error} style={{ marginBottom: 12 }} />
          ) : multipleQuery ? (
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
          ) : null}
          {(hasQuerySnapshot || requestReference) && (
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
                value={JSON.stringify(queryByType ?? requestReference, null, 2)}
              />
            </div>
          )}
        </>
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
