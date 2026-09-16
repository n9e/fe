import React, { useImperativeHandle, forwardRef, useContext } from 'react';
import { Space, Form, Button, Tooltip } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { SqlMonacoEditor } from '@fc-components/monaco-editor';
import { WandSparkles } from 'lucide-react';

import { CommonStateContext } from '@/App';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import QueryBoxPrefix, { QueryBoxColumn } from '@/components/QueryBoxPrefix';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';

import { NAME_SPACE } from '../../../constants';
import QueryInputAddonAfter from '../../components/QueryInputAddonAfter';

interface Props {
  snapRangeRef: React.MutableRefObject<{
    from?: number;
    to?: number;
  }>;
  executeQuery: () => void;

  queryBuilderPinned: boolean;
  queryBuilderVisible: boolean;
  onLableClick: () => void;
  /** Sits inside the SQL box at its left end (e.g. the AI trigger). */
  queryExtra?: React.ReactNode;
  /** Hangs under the SQL box, as wide as it. */
  noticeBanner?: React.ReactNode;
  queryBoxRef?: React.Ref<HTMLDivElement>;
  /** The user typed in the box; the value it now holds. */
  onQueryEdit?: (sql?: string) => void;
  /** Something open under the box (e.g. the AI dock): the editor then grows in flow and pushes it down instead of floating over it. */
  keepEditorInFlow?: boolean;
}

export default forwardRef(function QueryInputCpt(props: Props, ref) {
  const { t } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);

  const { snapRangeRef, executeQuery, queryBuilderPinned, queryBuilderVisible, onLableClick, queryExtra, noticeBanner, queryBoxRef, onQueryEdit, keepEditorInFlow } = props;

  const [focused, setFocused] = React.useState(false);

  const inputRef = React.useRef<any>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
  }));

  return (
    <QueryBoxColumn className='min-w-0' prefixed={!!queryExtra} below={noticeBanner}>
      <InputGroupWithFormItem
        className={classNames({
          'doris-sql-input-container-with-builder': queryBuilderVisible,
          'doris-sql-input-container-with-builder-unpinned': !queryBuilderPinned && queryBuilderVisible,
        })}
        label={
          <Space
            className='cursor-pointer'
            onMouseDown={(e) => {
              // Prevent outside click handler from firing before label click
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              // Prevent outside click handler from firing on touch
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              onLableClick();
            }}
          >
            {t(`${logExplorerNS}:query`)}
            <FilterOutlined />
          </Space>
        }
        addonAfter={<QueryInputAddonAfter executeQuery={executeQuery} />}
      >
        <div
          className={classNames('relative w-full hover:z-10', {
            'z-10': focused,
          })}
        >
          <div
            className={classNames('w-full', {
              absolute: queryBuilderPinned && !keepEditorInFlow,
            })}
          >
            <QueryBoxPrefix prefix={queryExtra} boxRef={queryBoxRef}>
              <Form.Item
                // With a dock under the box, the row's bottom margin moves to the column's end.
                className={queryExtra ? 'mb-0' : undefined}
                name={['query', 'sql']}
                rules={[{ required: true, message: t(`${logExplorerNS}:query_is_required`) }]}
              >
                <SqlMonacoEditor
                  // Room for the trigger pinned at the left; a utility, since antd's padding is important here.
                  className={classNames('bg-fc-100 z-0', { 'pl-8': !!queryExtra })}
                  onChange={(next) => onQueryEdit?.(next)}
                  maxHeight={200}
                  theme={darkMode ? 'dark' : 'light'}
                  enableAutocomplete
                  enableFormat
                  renderFormatButton={() => {
                    return (
                      <Tooltip title={t('common:format_sql')}>
                        <Button size='small' type='text' icon={<WandSparkles size={12} strokeWidth={1} />} />
                      </Tooltip>
                    );
                  }}
                  onEnter={() => {
                    snapRangeRef.current = {
                      from: undefined,
                      to: undefined,
                    };
                    executeQuery();
                  }}
                  onFocus={() => {
                    setFocused(true);
                  }}
                  onBlur={() => {
                    setFocused(false);
                  }}
                />
              </Form.Item>
            </QueryBoxPrefix>
          </div>
        </div>
      </InputGroupWithFormItem>
    </QueryBoxColumn>
  );
});
