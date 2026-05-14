/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/**
 * 表达式模式(代码模式)
 */
import React from 'react';
import { Form } from 'antd';
import { ExprMonacoEditor } from '@fc-components/monaco-editor';
import { validateExpr } from '@fc-components/monaco-editor/src/expr/validation';
import { useTranslation } from 'react-i18next';
import { CommonStateContext } from '@/App';

interface IProps {
  prefixField?: any;
  fullPrefixName?: (string | number)[]; // 完整的前置字段名，用于 getFieldValue 获取指定字段的值
  prefixName?: (string | number)[]; // 列表字段名
  disabled?: boolean;
  placeholder?: string;
}

export default function Code(props: IProps) {
  const { darkMode } = React.useContext(CommonStateContext);
  const { t } = useTranslation('alertRules');
  const { prefixField = {}, fullPrefixName = [], prefixName = [], disabled, placeholder = '$A > 0 && $B < $A' } = props;

  const getValidateErrorMessage = (errors: unknown[]) => {
    const firstError = errors?.[0];
    if (typeof firstError === 'string') {
      return firstError;
    }
    if (firstError && typeof firstError === 'object' && 'message' in firstError) {
      const message = (firstError as { message?: unknown }).message;
      if (typeof message === 'string' && message) {
        return message;
      }
    }
    return t('trigger.expr_invalid');
  };

  const handleValidate = (value?: string) => {
    if (!value) {
      return Promise.resolve();
    }
    const errors = validateExpr(value);
    if (errors.length > 0) {
      return Promise.reject(new Error(getValidateErrorMessage(errors as unknown[])));
    }
    return Promise.resolve();
  };

  return (
    <Form.Item
      {...prefixField}
      name={[...prefixName, 'exp']}
      validateTrigger={['onBlur']}
      rules={[
        {
          validator: (_, value) => handleValidate(value),
        },
      ]}
    >
      <ExprMonacoEditor theme={darkMode ? 'dark' : 'light'} placeholder={placeholder} enableAutocomplete={true} disabled={disabled} />
    </Form.Item>
  );
}
