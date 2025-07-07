import React, { useContext, useState } from 'react';
import { GlobalOutlined } from '@ant-design/icons';
import { PromQLMonacoEditor } from '@fc-components/monaco-editor';
import type * as monacoTypes from 'monaco-editor/esm/vs/editor/editor.api';

import { CommonStateContext } from '@/App';
import { N9E_PATHNAME } from '@/utils/constant';
import BuiltinMetrics from '@/components/PromQLInput/BuiltinMetrics';
import MetricsExplorer from '@/components/PromGraphCpt/components/MetricsExplorer';

export type { monacoTypes };

interface MonacoEditorPromQLProps {
  datasourceValue: number;
  showBuiltinMetrics?: boolean;
  variablesNames?: string[];
  size?: 'small' | 'middle' | 'large';
  value?: string;
  placeholder?: string;
  enableAutocomplete?: boolean;
  durationVariablesCompletion?: boolean;
  showGlobalMetrics?: boolean;
  interpolateString?: (query: string) => string;
  onChange?: (value: string) => void;
  onShiftEnter?: (value: string) => void;
  onBlur?: (value: string) => void;
  onEditorDidMount?: (editor: monacoTypes.editor.IStandaloneCodeEditor) => void;
  onMetricUnitChange?: (unit: string) => void; // 用于内置指标启用时选择指标获取对应的 unit
}

const URL_PREFIX = `/api/${N9E_PATHNAME}/proxy`;

export default function index(props: MonacoEditorPromQLProps) {
  const { darkMode } = useContext(CommonStateContext);
  const {
    datasourceValue,
    showBuiltinMetrics,
    variablesNames,
    size,
    value,
    placeholder,
    enableAutocomplete,
    durationVariablesCompletion,
    showGlobalMetrics,
    interpolateString,
    onChange,
    onShiftEnter,
    onBlur,
    onEditorDidMount,
    onMetricUnitChange,
  } = props;
  const [metricsExplorerVisible, setMetricsExplorerVisible] = useState(false);
  const editorRef = React.useRef<monacoTypes.editor.IStandaloneCodeEditor | null>(null);

  return (
    <>
      {/**
       * 把 Input.Group 改成 div { flex }
       * 解决 monaco-editor 在 Input.Group 下无法正常自动布局
       * https://github.com/microsoft/monaco-editor/issues/3393
       */}
      <div className='flex'>
        {showBuiltinMetrics && (
          <BuiltinMetrics
            addonClassName='flex-shrink-0 w-max flex'
            mode='dropdown'
            onSelect={(newValue, metric) => {
              onChange?.(newValue);
              onMetricUnitChange?.(metric.unit);
            }}
          />
        )}
        <span className='ant-input-affix-wrapper'>
          <PromQLMonacoEditor
            size={size}
            theme={darkMode ? 'dark' : 'light'}
            value={value}
            placeholder={placeholder || '请输入 PromQL 查询语句'}
            variablesNames={variablesNames}
            apiPrefix={`${URL_PREFIX}/${datasourceValue}/api/v1`}
            request={(resource, options) => {
              const params = options?.body?.toString();
              const search = params ? `?${params}` : '';
              return fetch(resource + search, {
                method: 'Get',
                headers: new Headers({
                  Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
                }),
              });
            }}
            enableAutocomplete={enableAutocomplete}
            durationVariablesCompletion={durationVariablesCompletion}
            interpolateString={interpolateString}
            onChange={onChange}
            onShiftEnter={onShiftEnter}
            onBlur={onBlur}
            editorDidMount={(editor) => {
              editorRef.current = editor;
              onEditorDidMount?.(editor);
            }}
          />
          {showGlobalMetrics && (
            <span className='ant-input-suffix'>
              <GlobalOutlined
                className='prom-graph-metrics-target'
                onClick={() => {
                  setMetricsExplorerVisible(true);
                }}
              />
            </span>
          )}
        </span>
      </div>
      <MetricsExplorer
        url={URL_PREFIX}
        datasourceValue={datasourceValue}
        show={metricsExplorerVisible}
        updateShow={setMetricsExplorerVisible}
        insertAtCursor={(val) => {
          console.log('editorRef.current', editorRef.current);
          if (editorRef.current) {
            const editor = editorRef.current;
            editor.trigger('keyboard', 'type', { text: val });
            editor.focus();
          }
        }}
      />
    </>
  );
}
