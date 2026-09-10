import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import i18next from 'i18next';
import { KQLMonacoEditor } from '@fc-components/monaco-editor';
import { IRawTimeRange } from '@/components/TimeRangePicker';
import { CommonStateContext } from '@/App';
import { HTTPClient as ESHTTPClient, CachedClient as ESCachedClient } from './client/elasticsearch';
import './locale';

export interface Props {
  datasourceValue?: number;
  query: {
    index?: string;
    date_field?: string;
    range?: IRawTimeRange;
  };
  historicalRecords: [string, number][];
  url?: string;
  readonly?: boolean;
  value?: string;
  onChange?: (expr?: string) => void;
  executeQuery?: (expr?: string) => void;
  completeEnabled?: boolean;
  trigger?: ('onBlur' | 'onEnter' | 'onChange')[]; // 触发 onChange 的事件
  placeholder?: string | false;
  onEnter?: () => void;
}

// editor 类型与 @fc-components/monaco-editor 同源，避免类型冲突
type KQLEditorProps = React.ComponentProps<typeof KQLMonacoEditor>;
type MonacoEditorInstance = Parameters<NonNullable<KQLEditorProps['editorDidMount']>>[0];

const handleEditorDidMount = (editor: MonacoEditorInstance) => {
  // 点击输入框时唤起补全，与旧 CodeMirror 编辑器行为一致（旧编辑器点击总是重新触发补全）
  editor.onMouseDown(() => {
    setTimeout(() => {
      editor.trigger('kql', 'editor.action.triggerSuggest', {});
    }, 0);
  });
};

export default function KQLInput(props: Props) {
  const {
    datasourceValue,
    query,
    historicalRecords, // 新编辑器暂不支持历史记录补全，保留 prop 以兼容旧调用方
    value,
    onChange,
    executeQuery,
    readonly = false,
    completeEnabled = true,
    trigger = ['onBlur', 'onEnter'],
    placeholder,
    onEnter,
  } = props;
  const { darkMode } = useContext(CommonStateContext);
  const [innerValue, setInnerValue] = useState<string | undefined>(value);
  const innerValueRef = useRef<string | undefined>(value);
  // KQLMonacoEditor 的 onBlur/onEnter 仅在挂载时注册一次，闭包会过期，
  // 这里通过 ref 始终拿到最新的 props（与 react-monaco-editor 内部 onChangeRef 同一模式）
  const latestPropsRef = useRef({ value, onChange, executeQuery, onEnter, trigger });
  latestPropsRef.current = { value, onChange, executeQuery, onEnter, trigger };

  useEffect(() => {
    innerValueRef.current = value;
    setInnerValue(value);
  }, [value]);

  const queryKey = JSON.stringify(query);
  const queryWithDefaultRange = useMemo(
    () => ({
      ...query,
      range: query.range || {
        start: 'now-12h',
        end: 'now',
      },
    }),
    [queryKey],
  );

  const completeClient = useMemo(() => {
    if (!completeEnabled) {
      return undefined;
    }
    return new ESCachedClient(
      new ESHTTPClient({
        datasourceValue,
        query: queryWithDefaultRange,
      }),
    );
  }, [completeEnabled, datasourceValue, JSON.stringify(queryWithDefaultRange)]);

  const fetchFieldNames = useCallback(async () => {
    if (!completeClient) return [];
    return completeClient.fields();
  }, [completeClient]);

  const fetchFieldValues = useCallback(
    async (fieldName: string) => {
      if (!completeClient) return [];
      return completeClient.fieldValues(fieldName);
    },
    [completeClient],
  );

  return (
    <KQLMonacoEditor
      size='middle'
      theme={darkMode ? 'dark' : 'light'}
      value={innerValue}
      readOnly={readonly}
      maxHeight={100}
      placeholder={placeholder === false || !placeholder ? i18next.t('kql:search') : placeholder}
      enableAutocomplete={completeEnabled && !readonly}
      fetchFieldNames={fetchFieldNames}
      fetchFieldValues={fetchFieldValues}
      editorDidMount={handleEditorDidMount}
      onChange={(newValue: string) => {
        innerValueRef.current = newValue;
        setInnerValue(newValue);
        if (_.includes(latestPropsRef.current.trigger, 'onChange')) {
          latestPropsRef.current.onChange?.(newValue);
        }
      }}
      onBlur={() => {
        const { value, onChange, trigger } = latestPropsRef.current;
        if (_.includes(trigger, 'onBlur') && innerValueRef.current !== value) {
          onChange?.(innerValueRef.current);
        }
      }}
      onEnter={() => {
        const { onChange, executeQuery, onEnter: onEnterProp, trigger } = latestPropsRef.current;
        executeQuery?.(innerValueRef.current);
        if (_.includes(trigger, 'onEnter')) {
          onChange?.(innerValueRef.current);
        }
        onEnterProp?.();
      }}
    />
  );
}
