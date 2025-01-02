import React, { useRef, useEffect, useContext } from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { FormItemInputContext } from 'antd/es/form/context';
import { parseRange } from '@/components/TimeRangePicker';
import { EditorView, highlightSpecialChars, keymap, ViewUpdate, placeholder as placeholderFunc } from '@codemirror/view';
import { EditorState, Prec, Compartment } from '@codemirror/state';
import { indentOnInput } from '@codemirror/language';
import { history, historyKeymap } from '@codemirror/history';
import { defaultKeymap, insertNewlineAndIndent } from '@codemirror/commands';
import { bracketMatching } from '@codemirror/matchbrackets';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/closebrackets';
import { highlightSelectionMatches } from '@codemirror/search';
import { commentKeymap } from '@codemirror/comment';
import { lintKeymap } from '@codemirror/lint';
import { autocompletion, completionKeymap, startCompletion, closeCompletion } from '@codemirror/autocomplete';
import { AccessTokenKey } from '@/utils/constant';
import request from '@/utils/request';
import { CommonStateContext } from '@/App';
import { LogQLExtension } from './logql';
import { baseTheme, lightTheme, darkTheme, highlighter } from './CMTheme';
import './locale';

const dynamicConfigCompartment = new Compartment();
const QLExtension = new LogQLExtension();

export interface Props {
  datasourceCate: string;
  datasourceValue: number;
  query: any;
  historicalRecords: [string, number][];
  url?: string;
  readonly?: boolean;
  headers?: { [index: string]: string };
  value?: string;
  onChange?: (expr?: string) => void;
  executeQuery?: (expr?: string) => void;
  validateTrigger?: string[];
  completeEnabled?: boolean;
  trigger?: ('onBlur' | 'onEnter')[]; // 触发 onChang 的事件
  placeholder?: string | false;
  onPressEnter?: () => void;
}

export default function index(props: Props) {
  const {
    datasourceCate,
    datasourceValue,
    query,
    historicalRecords,
    url = '/api/n9e',
    headers,
    value,
    onChange,
    executeQuery,
    readonly = false,
    validateTrigger = ['onChange', 'onBlur'],
    completeEnabled = true,
    trigger = ['onBlur', 'onEnter'],
    placeholder = '',
    onPressEnter,
  } = props;
  const { status } = useContext(FormItemInputContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const executeQueryCallback = useRef(executeQuery);
  const realValue = useRef<string | undefined>(value || '');
  const defaultHeaders = {
    Authorization: `Bearer ${localStorage.getItem(AccessTokenKey) || ''}`,
  };
  query.range = query.range || {
    start: 'now-12h',
    end: 'now',
  };
  const { darkMode } = useContext(CommonStateContext);
  const dynamicConfig = [darkMode ? darkTheme : lightTheme];

  useEffect(() => {
    executeQueryCallback.current = executeQuery;
    QLExtension.activateCompletion(true).setComplete(
      completeEnabled && datasourceCate !== 'doris'
        ? {
            clientCate: datasourceCate,
            remote: {
              url,
              fetchFn: (url: string) => {
                return request(url, {
                  method: 'Post',
                  headers: new Headers(
                    headers
                      ? {
                          ...defaultHeaders,
                          ...headers,
                        }
                      : defaultHeaders,
                  ),
                  body: JSON.stringify({
                    cate: datasourceCate,
                    datasource_id: datasourceValue,
                    query: [
                      {
                        ..._.omit(query, 'range'),
                        from: moment(parseRange(query.range).start).unix(),
                        to: moment(parseRange(query.range).end).unix(),
                      },
                    ],
                  }),
                }).then((res) => {
                  return res.dat || [];
                }) as any;
              },
            },
            historicalRecords,
          }
        : undefined,
    );

    const view = viewRef.current;
    if (view === null) {
      if (!containerRef.current) {
        throw new Error('expected CodeMirror container element to exist');
      }

      const startState = EditorState.create({
        doc: value,
        extensions: [
          baseTheme,
          highlightSpecialChars(),
          history(),
          EditorState.allowMultipleSelections.of(true),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          autocompletion({
            maxRenderedOptions: 10,
          }),
          highlightSelectionMatches(),
          highlighter,
          EditorView.lineWrapping,
          keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, ...commentKeymap, ...completionKeymap, ...lintKeymap]),
          placeholderFunc(placeholder === false ? '' : placeholder),
          QLExtension.asExtension(),
          EditorView.editable.of(!readonly),
          dynamicConfigCompartment.of(dynamicConfig),
          keymap.of([
            {
              key: 'Escape',
              run: (v: EditorView): boolean => {
                v.contentDOM.blur();
                return false;
              },
            },
          ]),
          Prec.override(
            keymap.of([
              {
                key: 'Enter',
                run: (v: EditorView): boolean => {
                  if (typeof executeQueryCallback.current === 'function') {
                    executeQueryCallback.current(realValue.current);
                  }
                  if (typeof onChange === 'function' && _.includes(trigger, 'onEnter')) {
                    onChange(realValue.current);
                  }
                  if (typeof onPressEnter === 'function') {
                    onPressEnter();
                  }
                  return true;
                },
              },
              {
                key: 'Shift-Enter',
                run: insertNewlineAndIndent,
              },
            ]),
          ),
          EditorView.updateListener.of((update: ViewUpdate): void => {
            if (typeof onChange === 'function') {
              const val = update.state.doc.toString();
              if (val !== realValue.current) {
                realValue.current = val;
                if (_.includes(validateTrigger, 'onChange')) {
                  onChange(val);
                }
                if (val === '' && viewRef.current) {
                  startCompletion(viewRef.current);
                }
              }
            }
          }),
        ],
      });

      const view = new EditorView({
        state: startState,
        parent: containerRef.current,
      });

      viewRef.current = view;
    }
  }, [JSON.stringify(headers), completeEnabled, datasourceValue, JSON.stringify(query), JSON.stringify(historicalRecords)]);

  useEffect(() => {
    if (realValue.current !== value) {
      const oldValue = realValue.current;
      realValue.current = value || '';
      const view = viewRef.current;
      if (view === null) {
        return;
      }
      view.dispatch(
        view.state.update({
          changes: { from: 0, to: oldValue?.length || 0, insert: value },
        }),
      );
    }
  }, [value]);

  return (
    <div
      className={classNames({ 'ant-input': true, 'ant-input-status-error': status === 'error', readonly: readonly, 'logql-codemirror': true })}
      onBlur={() => {
        if (typeof onChange === 'function' && _.includes(trigger, 'onBlur')) {
          if (realValue.current !== value) {
            onChange(realValue.current);
          }
        }
        if (viewRef.current) {
          closeCompletion(viewRef.current);
        }
      }}
      onClick={() => {
        if (viewRef.current) {
          startCompletion(viewRef.current);
        }
      }}
    >
      <div className='input-content' ref={containerRef} />
    </div>
  );
}
