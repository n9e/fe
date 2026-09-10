import React, { useContext, useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { PromQLMonacoEditor } from '@fc-components/monaco-editor';
import _ from 'lodash';
import { useGetState } from 'ahooks';
import { useTranslation } from 'react-i18next';

import { CommonStateContext } from '@/App';
import { N9E_PATHNAME } from '@/utils/constant';
import BuiltinMetrics from '@/components/PromQLInput/BuiltinMetrics';
import MetricsExplorer from '@/components/PromGraphCpt/components/MetricsExplorer';

import { interpolateString, instantInterpolateString, includesVariables, getRealStep } from './utils';

import './style.less';

// editor 类型与 @fc-components/monaco-editor 同源，避免与其内部 monaco-editor 副本（版本不同）产生类型冲突
type PromQLEditorProps = React.ComponentProps<typeof PromQLMonacoEditor>;
type MonacoEditor = Parameters<NonNullable<PromQLEditorProps['editorDidMount']>>[0];

export { interpolateString, instantInterpolateString, includesVariables, getRealStep };

interface MonacoEditorPromQLProps {
  readOnly?: boolean;
  datasourceValue: number;
  showBuiltinMetrics?: boolean;
  variablesNames?: string[];
  size?: 'small' | 'middle' | 'large';
  value?: string;
  placeholder?: string;
  maxHeight?: number | string;
  enableAutocomplete?: boolean;
  durationVariablesCompletion?: boolean;
  showGlobalMetrics?: boolean;
  /** Rendered inside the box at its right end, after the metrics search (e.g. the AI trigger). */
  suffix?: React.ReactNode;
  onChangeTrigger?: string[]; // 触发 onChange 的事件
  interpolateString?: (query: string) => string;
  onChange?: (value?: string) => void;
  onDraftChange?: (value?: string) => void;
  onEnter?: (value?: string) => void;
  onBlur?: (value?: string) => void;
  onEditorDidMount?: (editor: MonacoEditor) => void;
  onMetricUnitChange?: (unit: string) => void; // 用于内置指标启用时选择指标获取对应的 unit
}

const URL_PREFIX = `/api/${N9E_PATHNAME}/proxy`;

export default function index(props: MonacoEditorPromQLProps) {
  const { t } = useTranslation();
  const { darkMode: appDarkMode } = useContext(CommonStateContext);
  // hoc打开的组件获取不到 App 中 useContext, 这里用localStorage兜底；无痕第一次登录时 兜不住，再拿body上的classname来兜底一下
  const darkMode = appDarkMode ?? (localStorage.getItem('darkMode') === 'true' || document.body.classList.contains('theme-dark'));
  const {
    readOnly,
    datasourceValue,
    showBuiltinMetrics,
    variablesNames,
    size,
    placeholder,
    maxHeight,
    enableAutocomplete,
    durationVariablesCompletion,
    showGlobalMetrics,
    suffix,
    onChangeTrigger,
    interpolateString,
    onChange,
    onDraftChange,
    onEnter,
    onBlur,
    onEditorDidMount,
    onMetricUnitChange,
  } = props;
  const [metricsExplorerVisible, setMetricsExplorerVisible] = useState(false);
  const editorRef = React.useRef<MonacoEditor | null>(null);
  const [value, setValue, getValue] = useGetState<string | undefined>(props.value);

  useEffect(() => {
    if (props.value !== value) {
      setValue(props.value);
    }
  }, [props.value]);

  return (
    <>
      {/**
       * 把 Input.Group 改成 div { flex }
       * 解决 monaco-editor 在 Input.Group 下无法正常自动布局
       * https://github.com/microsoft/monaco-editor/issues/3393
       */}
      <div className={`promql-input-ng-container flex${showBuiltinMetrics ? ' has-builtin-metrics' : ''}`}>
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
        <span
          className='ant-input-affix-wrapper'
          style={
            maxHeight !== undefined
              ? {
                  maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
                  overflowY: 'auto',
                }
              : undefined
          }
        >
          <PromQLMonacoEditor
            readOnly={readOnly}
            size={size}
            theme={darkMode ? 'dark' : 'light'}
            value={value}
            placeholder={placeholder || t('promQLInput:placeholder')}
            variablesNames={variablesNames}
            apiPrefix={`${URL_PREFIX}/${datasourceValue}/api/v1`}
            enableRequests={datasourceValue !== undefined}
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
            onChange={(newValue) => {
              setValue(newValue);
              if (newValue !== props.value) onDraftChange?.(newValue);
              // 如果 onChangeTrigger 没有设置或为空，则直接触发 onChange
              if (!onChangeTrigger || onChangeTrigger?.length === 0) {
                onChange?.(newValue);
              }
            }}
            onEnter={() => {
              const currentValue = getValue();
              // 如果 onChangeTrigger 包含 'onEnter'，则触发 onChange
              if (_.includes(onChangeTrigger, 'onEnter')) {
                onChange?.(currentValue);
              }
              onEnter?.(currentValue);
            }}
            onBlur={() => {
              const currentValue = getValue();
              if (_.includes(onChangeTrigger, 'onBlur')) {
                onChange?.(currentValue);
              }
              onBlur?.(currentValue);
            }}
            editorDidMount={(editor) => {
              editorRef.current = editor;
              editor.onKeyDown((e) => {
                if (e.code === 'Escape') {
                  const suggestWidgetVisible = (editor as any)?._contextKeyService?.getContextKeyValue?.('suggestWidgetVisible');

                  if (suggestWidgetVisible) {
                    editor.trigger('keyboard', 'hideSuggestWidget', {});
                  }
                  e.stopPropagation();
                }
              });
              onEditorDidMount?.(editor);
            }}
          />
          {showGlobalMetrics || suffix ? (
            <span className='ant-input-suffix gap-2'>
              {showGlobalMetrics && (
                <Search
                  size={16}
                  className='prom-graph-metrics-target'
                  onClick={() => {
                    setMetricsExplorerVisible(true);
                  }}
                />
              )}
              {suffix}
            </span>
          ) : null}
        </span>
      </div>
      <MetricsExplorer
        url={URL_PREFIX}
        datasourceValue={datasourceValue}
        show={metricsExplorerVisible}
        updateShow={setMetricsExplorerVisible}
        insertAtCursor={(val) => {
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
