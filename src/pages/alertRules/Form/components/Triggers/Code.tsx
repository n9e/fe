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
import { Form, Input } from 'antd';

interface IProps {
  prefixField?: any;
  fullPrefixName?: (string | number)[]; // 完整的前置字段名，用于 getFieldValue 获取指定字段的值
  prefixName?: (string | number)[]; // 列表字段名
  disabled?: boolean;
  placeholder?: string;
}

export default function Code(props: IProps) {
  const { prefixField = {}, fullPrefixName = [], prefixName = [], disabled, placeholder = '$A > 0 && $B < $A' } = props;

  return (
    <Form.Item {...prefixField} name={[...prefixName, 'exp']}>
      <Input disabled={disabled} placeholder={placeholder} />
    </Form.Item>
  );
}
