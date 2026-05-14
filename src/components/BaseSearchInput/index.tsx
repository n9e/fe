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
import React, { useEffect, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Input, InputProps } from 'antd';
import _ from 'lodash';

interface IBaseSearchInputProps extends InputProps {
  onSearch?: (value: string) => unknown;
}

const BaseSearchInput: React.FC<IBaseSearchInputProps> = ({ onSearch, ...props }) => {
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    if (props.value === undefined || props.value === null) {
      setValue('');
      return;
    }

    setValue(typeof props.value === 'string' ? props.value : String(props.value));
  }, [props.value]);

  return (
    <Input
      prefix={<SearchOutlined />}
      value={value}
      onChange={(e) => {
        setValue(e.target.value);

        if (e.target.value === '') {
          onSearch && onSearch('');
        }
      }}
      onPressEnter={(e) => {
        onSearch && onSearch(value);
      }}
      onBlur={(e) => {
        onSearch && onSearch(value);
      }}
      {..._.omit(props, 'value')}
    />
  );
};

export default BaseSearchInput;
