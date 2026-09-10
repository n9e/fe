import React, { useImperativeHandle, forwardRef, useContext } from 'react';
import { Space, Form, Button, Tooltip } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { SqlMonacoEditor } from '@fc-components/monaco-editor';
import { WandSparkles } from 'lucide-react';

import { CommonStateContext } from '@/App';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { AiQueryDockAffix } from '@/components/AiQueryDock/Affix';
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
}

export default forwardRef(function QueryInputCpt(props: Props, ref) {
  const { t } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);

  const { snapRangeRef, executeQuery, queryBuilderPinned, queryBuilderVisible, onLableClick, queryExtra, noticeBanner, queryBoxRef, onQueryEdit } = props;

  const [focused, setFocused] = React.useState(false);

  const inputRef = React.useRef<any>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
  }));

  return (
    <div className={classNames('min-w-0', { 'ai-query-dock-host': !!queryExtra })}>
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
              absolute: queryBuilderPinned,
            })}
          >
            <AiQueryDockAffix trigger={queryExtra} boxRef={queryBoxRef}>
              <Form.Item
                // With a dock under the box, the row's bottom margin moves to the column's end.
                className={queryExtra ? 'mb-0' : undefined}
                name={['query', 'sql']}
                rules={[{ required: true, message: t(`${logExplorerNS}:query_is_required`) }]}
              >
                <SqlMonacoEditor
                  className={classNames('bg-fc-100 z-0', { 'ai-query-dock-padded': !!queryExtra })}
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
            </AiQueryDockAffix>
          </div>
        </div>
      </InputGroupWithFormItem>
      {noticeBanner}
    </div>
  );
});
