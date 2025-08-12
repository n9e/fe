import React, { useRef, useCallback } from 'react';
import { Input, Button, Row, Col } from 'antd';
import type { InputRef } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { IAfterGuiAttachedParams } from 'ag-grid-community';
import type { CustomFilterDisplayProps } from 'ag-grid-react';
import { useGridFilterDisplay } from 'ag-grid-react';

import { SIZE } from '@/utils/constant';

const CustomColumnFilter = ({ state, onStateChange, onAction, api }: CustomFilterDisplayProps) => {
  const { t } = useTranslation();
  const refInput = useRef<InputRef>(null);
  const afterGuiAttached = useCallback((params?: IAfterGuiAttachedParams) => {
    if (!params || !params.suppressFocus) {
      refInput.current?.focus({
        cursor: 'end',
      });
    }
  }, []);

  useGridFilterDisplay({
    afterGuiAttached,
  });

  return (
    <div className='w-[200px] p-2 n9e-base-shadow n9e-fill-color-2 rounded'>
      <div className='mb-2'>
        <Input
          ref={refInput}
          placeholder={t('common:search_placeholder2')}
          value={state.model || ''}
          onChange={(e) => {
            const newValue = e.target.value || '';
            onStateChange({ ...state, model: newValue });
          }}
          onPressEnter={() => {
            onAction('apply');
            api.hidePopupMenu();
          }}
          prefix={<SearchOutlined />}
        />
      </div>
      <Row gutter={SIZE}>
        <Col span={12}>
          <Button
            className='w-full'
            type='primary'
            size='small'
            onClick={() => {
              onAction('apply');
              api.hidePopupMenu();
            }}
          >
            {t('common:btn.search')}
          </Button>
        </Col>
        <Col span={12}>
          <Button
            className='w-full'
            size='small'
            onClick={() => {
              onStateChange({ ...state, model: '' });
              onAction('reset');
              api.hidePopupMenu();
            }}
          >
            {t('common:btn.reset')}
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default CustomColumnFilter;

export function doesFilterPass(params) {
  const { model, handlerParams } = params;
  if (!model) return true; // 没有过滤器时显示所有数据

  const value = handlerParams.getValue(params.node);
  if (!value) return false;

  // 分词搜索，确保每个词都匹配
  let passed = true;
  model
    .toLowerCase()
    .split(' ')
    .forEach((filterWord) => {
      if (value.toString().toLowerCase().indexOf(filterWord) < 0) {
        passed = false;
      }
    });
  return passed;
}
