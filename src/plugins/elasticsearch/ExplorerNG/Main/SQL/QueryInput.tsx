import React, { useImperativeHandle, forwardRef, useContext } from 'react';
import { Space, Form } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { SqlMonacoEditor } from '@fc-components/monaco-editor';

import { CommonStateContext } from '@/App';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';
import { IS_PLUS } from '@/utils/constant';

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
}

export default forwardRef(function QueryInputCpt(props: Props, ref) {
  const { t } = useTranslation(NAME_SPACE);
  const { darkMode } = useContext(CommonStateContext);

  const { snapRangeRef, executeQuery, queryBuilderPinned, queryBuilderVisible, onLableClick } = props;

  const [focused, setFocused] = React.useState(false);

  const inputRef = React.useRef<any>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
  }));

  return (
    <InputGroupWithFormItem
      className={classNames({
        'es-sql-input-container-with-builder': queryBuilderVisible,
        'es-sql-input-container-with-builder-unpinned': !queryBuilderPinned && queryBuilderVisible,
      })}
      label={
        IS_PLUS ? (
          <Space
            className='cursor-pointer'
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
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
        ) : (
          t(`${logExplorerNS}:query`)
        )
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
          <Form.Item name={['query', 'sql']} rules={[{ required: true, message: t(`${logExplorerNS}:query_is_required`) }]}>
            <SqlMonacoEditor
              className='bg-fc-100 z-0'
              maxHeight={200}
              theme={darkMode ? 'dark' : 'light'}
              enableAutocomplete={true}
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
        </div>
      </div>
    </InputGroupWithFormItem>
  );
});
