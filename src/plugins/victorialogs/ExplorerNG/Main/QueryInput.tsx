import React from 'react';
import _ from 'lodash';
import { Form, Space } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import SharedQueryInput from '@/pages/logExplorer/components/QueryInput';
import { NAME_SPACE as logExplorerNS } from '@/pages/logExplorer/constants';

import { NAME_SPACE } from '../../constants';
import QueryInputAddonAfter from '../components/QueryInputAddonAfter';

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

function getTextAreaValue(refValue: any) {
  return refValue?.resizableTextArea?.textArea?.value ?? refValue?.textArea?.value ?? refValue?.input?.value;
}

export default React.forwardRef<QueryInputHandle, Props>(function QueryInput(props, ref) {
  const { executeQuery, queryBuilderPinned, queryBuilderVisible, onLableClick, onContentChange } = props;
  const { t } = useTranslation(NAME_SPACE);
  const form = Form.useFormInstance();
  const datasourceValue = Form.useWatch('datasourceValue');
  const inputRef = React.useRef<any>(null);
  const [focused, setFocused] = React.useState(false);

  const handleCommit = (value?: string) => {
    const query = form.getFieldValue('query') || {};
    const nextValue = value ?? getTextAreaValue(inputRef.current) ?? '';
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
    commit: () => handleCommit(),
  }));

  if (!datasourceValue) return null;

  return (
    <InputGroupWithFormItem
      className={classNames({
        'victorialogs-input-container-with-builder': queryBuilderVisible,
        'victorialogs-input-container-with-builder-unpinned': !queryBuilderPinned && queryBuilderVisible,
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
            <SharedQueryInput
              inputRef={inputRef}
              onChange={handleCommit}
              onEnterPress={(value) => {
                handleCommit(value);
                executeQuery();
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </Form.Item>
        </div>
      </div>
    </InputGroupWithFormItem>
  );
});
