import React from 'react';
import { Form, Input, Space } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
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

export default function QueryInput(props: Props) {
  const { executeQuery, queryBuilderPinned, queryBuilderVisible, onLableClick, onContentChange } = props;
  const { t } = useTranslation(NAME_SPACE);
  const form = Form.useFormInstance();
  const datasourceValue = Form.useWatch('datasourceValue');

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
      <div className='relative w-full hover:z-10'>
        <div
          className={classNames('w-full', {
            absolute: queryBuilderPinned,
          })}
        >
          <Form.Item name={['query', 'query']} rules={[{ required: true, whitespace: true, message: t(`${logExplorerNS}:query_is_required`) }]}>
            <Input
              onChange={() => {
                onContentChange?.();
                const query = form.getFieldValue('query') || {};
                if (query.querySource === 'builder') {
                  form.setFieldsValue({
                    query: {
                      ...query,
                      querySource: 'code',
                      builderStatus: 'stale',
                    },
                  });
                }
              }}
              onPressEnter={() => {
                executeQuery();
              }}
            />
          </Form.Item>
        </div>
      </div>
    </InputGroupWithFormItem>
  );
}
