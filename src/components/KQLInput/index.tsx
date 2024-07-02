import React, { useRef, useEffect, useContext } from 'react';
import classNames from 'classnames';
import _ from 'lodash';
import i18next from 'i18next';
import { IRawTimeRange } from '@/components/TimeRangePicker';
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
import { CommonStateContext } from '@/App';
import { kQLExtension } from './kql';
import { baseTheme, lightTheme, darkTheme, highlighter } from './CMTheme';
import './style.less';
import './locale';

const dynamicConfigCompartment = new Compartment();
const QLExtension = new kQLExtension();

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
  trigger?: ('onBlur' | 'onEnter')[]; // 触发 onChang 的事件
  placeholder?: string | false;
  onEnter?: () => void;
}

export default function index(props: Props) {
  const {
    datasourceValue,
    query,
    historicalRecords,
    value,
    onChange,
    executeQuery,
    readonly = false,
    completeEnabled = true,
    trigger = ['onBlur', 'onEnter'],
    placeholder,
    onEnter,
  } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const executeQueryCallback = useRef(executeQuery);
  const realValue = useRef<string | undefined>(value || '');
  query.range = query.range || {
    start: 'now-12h',
    end: 'now',
  };
  const { darkMode } = useContext(CommonStateContext);
  const dynamicConfig = [darkMode ? darkTheme : lightTheme];

  useEffect(() => {
    executeQueryCallback.current = executeQuery;
    QLExtension.activateCompletion(true).setComplete(
      completeEnabled
        ? {
            remote: {
              datasourceValue,
              query,
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
          placeholderFunc(placeholder === false || !placeholder ? i18next.t('kql:search') : placeholder),
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
                  if (onEnter) {
                    onEnter();
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
                if (_.includes(trigger, 'onChange')) {
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
  }, [completeEnabled, datasourceValue, JSON.stringify(query), JSON.stringify(historicalRecords)]);

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
      className={classNames({ 'ant-input': true, readonly: readonly, 'kql-input': true })}
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
