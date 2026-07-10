import React, { useCallback, useContext, useEffect, useRef } from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { LokiMonacoEditor } from '@fc-components/monaco-editor';
import type { LabelMatcher } from '@fc-components/monaco-editor';

import { CommonStateContext } from '@/App';
import { parseRange } from '@/components/TimeRangePicker';
import { DatasourceCateEnum } from '@/utils/constant';
import { NAME_SPACE } from '../../constants';
import { getLabelNames, getLabelValues } from '../services';

export interface LokiLogQLInputProps {
  value?: string;
  datasourceValue?: number;
  range?: any;
  readonly?: boolean;
  placeholder?: string;
  onChange?: (value?: string) => void;
  onExecute?: (value?: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

function matchersToQuery(matchers: LabelMatcher[]): string | undefined {
  if (matchers.length === 0) return undefined;
  return `{${matchers.map((m) => `${m.label}${m.operator}${m.value}`).join(',')}}`;
}

export default function LogQLInput(props: LokiLogQLInputProps) {
  const { t } = useTranslation(NAME_SPACE);
  const { value, datasourceValue, range, readonly = false, placeholder = t('query_placeholder'), onChange, onExecute, onFocus, onBlur } = props;
  const { darkMode } = useContext(CommonStateContext);
  const draftValueRef = useRef<string>(value || '');
  const committedValueRef = useRef<string>(value || '');
  const onChangeRef = useRef(onChange);
  const onExecuteRef = useRef(onExecute);
  const onFocusRef = useRef(onFocus);
  const onBlurRef = useRef(onBlur);

  onChangeRef.current = onChange;
  onExecuteRef.current = onExecute;
  onFocusRef.current = onFocus;
  onBlurRef.current = onBlur;

  const commitDraft = () => {
    const nextValue = draftValueRef.current || '';
    if (nextValue !== committedValueRef.current) {
      committedValueRef.current = nextValue;
      onChangeRef.current?.(nextValue);
    }
    return nextValue;
  };

  const datasourceValueRef = useRef(datasourceValue);
  datasourceValueRef.current = datasourceValue;
  const rangeRef = useRef(range);
  rangeRef.current = range;

  const fetchLabelNames = useCallback(async (currentMatchers: LabelMatcher[]): Promise<string[]> => {
    const dsValue = datasourceValueRef.current;
    const rangeVal = rangeRef.current;
    if (!dsValue || !rangeVal) return [];
    try {
      const parsed = parseRange(rangeVal);
      const fields = await getLabelNames({
        cate: DatasourceCateEnum.loki,
        datasource_id: dsValue,
        query: matchersToQuery(currentMatchers),
        start: moment(parsed.start).valueOf(),
        end: moment(parsed.end).valueOf(),
        limit: 100,
      });
      return fields.map((f) => f.field);
    } catch {
      return [];
    }
  }, []);

  const fetchLabelValues = useCallback(async (labelName: string, currentMatchers: LabelMatcher[]): Promise<string[]> => {
    const dsValue = datasourceValueRef.current;
    const rangeVal = rangeRef.current;
    if (!dsValue || !rangeVal) return [];
    try {
      const parsed = parseRange(rangeVal);
      const values = await getLabelValues({
        cate: DatasourceCateEnum.loki,
        datasource_id: dsValue,
        query: matchersToQuery(currentMatchers),
        start: moment(parsed.start).valueOf(),
        end: moment(parsed.end).valueOf(),
        label: labelName,
        limit: 100,
      });
      return values.map((v) => v.value);
    } catch {
      return [];
    }
  }, []);

  const handleChange = useCallback((nextValue: string) => {
    draftValueRef.current = nextValue;
  }, []);

  const handleFocus = useCallback(() => {
    onFocusRef.current?.();
  }, []);

  const handleBlur = useCallback(() => {
    commitDraft();
    onBlurRef.current?.();
  }, []);

  const handleEnter = useCallback((nextValue: string) => {
    draftValueRef.current = nextValue;
    commitDraft();
    onExecuteRef.current?.(nextValue);
  }, []);

  useEffect(() => {
    const nextValue = value || '';
    if (draftValueRef.current !== nextValue) {
      draftValueRef.current = nextValue;
      committedValueRef.current = nextValue;
    }
  }, [value]);

  return (
    <LokiMonacoEditor
      value={value || ''}
      theme={darkMode ? 'dark' : 'light'}
      placeholder={placeholder}
      readOnly={readonly}
      onChange={handleChange}
      onEnter={handleEnter}
      onBlur={handleBlur}
      onFocus={handleFocus}
      fetchLabelNames={fetchLabelNames}
      fetchLabelValues={fetchLabelValues}
    />
  );
}
