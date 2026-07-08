import React, { useContext, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import classNames from 'classnames';
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
import { autocompletion, closeCompletion, completionKeymap, completionStatus, startCompletion } from '@codemirror/autocomplete';
import { PromQLExtension } from '@fc-components/codemirror-promql';

import { CommonStateContext } from '@/App';
import { baseTheme, darkTheme, lightTheme, promqlHighlighter } from '@/components/LogQLInput/CMTheme';

import { createLokiLogQLCompletionSource, LokiCompletionSourceParams } from '../utils/logqlCompletion';

const dynamicConfigCompartment = new Compartment();
const promqlExtension = new PromQLExtension().activateCompletion(false).activateLinter(false);

export interface LokiLogQLInputProps {
  value?: string;
  datasourceValue?: number;
  range?: any;
  readonly?: boolean;
  placeholder?: string;
  onChange?: (value?: string) => void;
  onExecute?: (value?: string) => void;
  onContentChange?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export interface LokiLogQLInputHandle {
  commit: () => string;
}

export default React.forwardRef<LokiLogQLInputHandle, LokiLogQLInputProps>(function LogQLInput(props, ref) {
  const { value, datasourceValue, range, readonly = false, placeholder = 'Enter a Loki query', onChange, onExecute, onFocus, onBlur } = props;
  const { darkMode } = useContext(CommonStateContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const draftValueRef = useRef<string>(value || '');
  const committedValueRef = useRef<string>(value || '');
  const onChangeRef = useRef(onChange);
  const onExecuteRef = useRef(onExecute);
  const onFocusRef = useRef(onFocus);
  const onBlurRef = useRef(onBlur);
  const paramsRef = useRef<LokiCompletionSourceParams>({ datasourceValue, range });

  onChangeRef.current = onChange;
  onExecuteRef.current = onExecute;
  onFocusRef.current = onFocus;
  onBlurRef.current = onBlur;
  paramsRef.current = { datasourceValue, range };

  const completionSource = useMemo(() => createLokiLogQLCompletionSource(() => paramsRef.current), []);
  const commitDraft = () => {
    const nextValue = draftValueRef.current || '';
    if (nextValue !== committedValueRef.current) {
      committedValueRef.current = nextValue;
      onChangeRef.current?.(nextValue);
    }
    return nextValue;
  };

  useImperativeHandle(ref, () => ({
    commit: commitDraft,
  }));

  useEffect(() => {
    const dynamicConfig = [darkMode ? darkTheme : lightTheme];
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
            override: [completionSource],
            maxRenderedOptions: 20,
          }),
          highlightSelectionMatches(),
          promqlHighlighter,
          EditorView.lineWrapping,
          keymap.of([...closeBracketsKeymap, ...defaultKeymap, ...historyKeymap, ...commentKeymap, ...completionKeymap, ...lintKeymap]),
          placeholderFunc(placeholder),
          promqlExtension.asExtension(),
          EditorView.editable.of(!readonly),
          EditorView.domEventHandlers({
            focus: () => {
              onFocusRef.current?.();
            },
            blur: () => {
              if (viewRef.current) closeCompletion(viewRef.current);
              commitDraft();
              onBlurRef.current?.();
            },
          }),
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
                  if (completionStatus(v.state)) return false;
                  const nextValue = commitDraft();
                  onExecuteRef.current?.(nextValue);
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
            if (update.docChanged) {
              const val = update.state.doc.toString();
              draftValueRef.current = val;
            }
          }),
        ],
      });

      viewRef.current = new EditorView({
        state: startState,
        parent: containerRef.current,
      });
    } else {
      view.dispatch(
        view.state.update({
          effects: dynamicConfigCompartment.reconfigure(dynamicConfig),
        }),
      );
    }
  }, [completionSource, darkMode]);

  useEffect(() => {
    return () => {
      viewRef.current?.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const nextValue = value || '';
    if (draftValueRef.current !== nextValue) {
      draftValueRef.current = nextValue;
      committedValueRef.current = nextValue;
      const view = viewRef.current;
      if (view === null) return;
      view.dispatch(
        view.state.update({
          changes: { from: 0, to: view.state.doc.length, insert: nextValue },
        }),
      );
    }
  }, [value]);

  return (
    <div
      className={classNames({ 'ant-input': true, readonly, 'promql-input': true, 'loki-logql-input': true })}
      onClick={() => {
        if (viewRef.current) startCompletion(viewRef.current);
      }}
    >
      <div className='input-content' ref={containerRef} />
    </div>
  );
});
