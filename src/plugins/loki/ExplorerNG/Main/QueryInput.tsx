import React from 'react';
import _ from 'lodash';
import { Form, Space } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';

import { NAME_SPACE } from '../../constants';
import QueryInputAddonAfter from '../components/QueryInputAddonAfter';
import LogQLInput, { LokiLogQLInputHandle } from './LogQLInput';

interface Props {
  executeQuery: () => void;
  queryBuilderPinned: boolean;
  queryBuilderVisible: boolean;
  onLableClick: () => void;
  onContentChange?: () => void;
}

export interface QueryInputHandle {
  commit: () => string | undefined;
}

export default React.forwardRef<QueryInputHandle, Props>(function QueryInput(props, ref) {
  const { executeQuery, queryBuilderPinned, queryBuilderVisible, onLableClick, onContentChange } = props;
  const { t } = useTranslation(NAME_SPACE);
  const form = Form.useFormInstance();
  const datasourceValue = Form.useWatch('datasourceValue');
  const range = Form.useWatch(['query', 'range']);
  const inputRef = React.useRef<LokiLogQLInputHandle>(null);
  const [focused, setFocused] = React.useState(false);

  const handleCommit = (value?: string) => {
    const query = form.getFieldValue('query') || {};
    const nextValue = value || '';
    if (_.toString(query.query || '') === nextValue) return nextValue;
    form.setFieldsValue({
      query: {
        ...query,
        query: nextValue,
        ...(query.querySource === 'builder'
          ? {
              querySource: 'code',
              builderStatus: 'stale',
            }
          : {}),
      },
    });
    onContentChange?.();
    return nextValue;
  };

  React.useImperativeHandle(ref, () => ({
    commit: () => inputRef.current?.commit(),
  }));

  if (!datasourceValue) return null;

  return (
    <InputGroupWithFormItem
      className={classNames({
        'loki-input-container-with-builder': queryBuilderVisible,
        'loki-input-container-with-builder-unpinned': !queryBuilderPinned && queryBuilderVisible,
      })}
      label={
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
          <Form.Item name={['query', 'query']} rules={[{ required: true, whitespace: true, message: t(`${logExplorerNS}:query_is_required`) }]}>
            <LogQLInput
              ref={inputRef}
              datasourceValue={datasourceValue}
              range={range}
              onChange={handleCommit}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onExecute={() => {
                executeQuery();
              }}
            />
          </Form.Item>
        </div>
      </div>
    </InputGroupWithFormItem>
  );
});
