import React, { useImperativeHandle, forwardRef, useContext, useRef } from 'react';
import { Form, Button, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { SqlMonacoEditor } from '@fc-components/monaco-editor';
import { WandSparkles } from 'lucide-react';

import { CommonStateContext } from '@/App';
import QueryBoxPrefix from '@/components/QueryBoxPrefix';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';

import QueryInputAddonAfter from '../../components/QueryInputAddonAfter';

interface Props {
  executeQuery: () => void;
  onSelectSQL: () => void;
  queryExtra?: React.ReactNode;
  queryBoxRef?: React.Ref<HTMLDivElement>;
  onQueryEdit?: (sql?: string) => void;
}

// The box has a fixed height and the shortcut hint is pinned inside it, so both use this. 192 + the workspace
// body's 8px bottom padding = the 200px body the assist panels also fill.
const BOX_HEIGHT_CLASS = 'h-[192px]';

export default forwardRef(function QueryInputCpt({ executeQuery, onSelectSQL, queryExtra, queryBoxRef, onQueryEdit }: Props, ref) {
  const { t } = useTranslation(logExplorerNS);
  const { darkMode } = useContext(CommonStateContext);
  const syntax = Form.useWatch(['query', 'syntax']);
  const inputRef = useRef<{ focus: () => void }>();
  const editorRef = useRef<{ format: () => void }>(null);

  useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }));

  // The box is fixed height while the editor is laid out to its content, so a click on the
  // blank part of the box lands on the wrapper instead of the editor: hand it the focus.
  const focusEditor = () => inputRef.current?.focus();

  return (
    <div className='relative'>
      <div className='absolute right-1 top-1 z-10 flex items-center gap-0'>
        <QueryInputAddonAfter executeQuery={executeQuery} onSelectSQL={onSelectSQL} />
        <Tooltip title={t('common:format_sql')}>
          <Button
            size='small'
            type='text'
            className='flex h-6 w-6 items-center justify-center p-0'
            icon={<WandSparkles size={12} strokeWidth={1} />}
            onClick={() => editorRef.current?.format()}
          />
        </Tooltip>
      </div>
      <QueryBoxPrefix prefix={queryExtra} boxRef={queryBoxRef}>
        <div className='relative cursor-text' onClick={focusEditor}>
          <Form.Item name={['query', 'sql']} rules={[{ required: syntax === 'sql', message: t('query_is_required') }]}>
            <SqlMonacoEditor
              ref={editorRef}
              className={classNames(
                BOX_HEIGHT_CLASS,
                'bg-fc-100 resize-none border-0 pl-0 pr-16 shadow-none [&::-webkit-scrollbar]:h-[6px] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar]:invisible [&::-webkit-scrollbar-thumb]:invisible [&::-webkit-scrollbar-thumb]:rounded-[3px] [&::-webkit-scrollbar-thumb]:bg-[rgba(0,0,0,0.1)] [&:hover::-webkit-scrollbar]:visible [&:hover::-webkit-scrollbar-thumb]:visible [&::-webkit-scrollbar-corner]:bg-transparent',
                { 'pl-8': !!queryExtra },
              )}
              onChange={onQueryEdit}
              placeholder={t('sql_placeholder')}
              theme={darkMode ? 'dark' : 'light'}
              enableAutocomplete
              editorDidMount={(editor) => {
                inputRef.current = editor;
              }}
              onEnter={executeQuery}
            />
          </Form.Item>
          <div className={classNames('pointer-events-none absolute inset-x-0 top-0 flex items-end justify-end pr-2 pb-1.5', BOX_HEIGHT_CLASS)}>
            <span className='bg-fc-100 px-1 text-xs text-soft'>{t('sql_shortcut_hint')}</span>
          </div>
        </div>
      </QueryBoxPrefix>
    </div>
  );
});
