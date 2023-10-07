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
import React from 'react';
import { Form, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
export const DATASOURCE_ALL = 0;

interface IProps {
  setFieldsValue: any;
  cate: string;
  datasourceList: { id: number; name: string }[];
  mode?: 'multiple';
  required?: boolean;
  disabled?: boolean;
}

export default function index({ setFieldsValue, cate, datasourceList, mode, required = true, disabled }: IProps) {
  const { t } = useTranslation();
  const handleClusterChange = (v: number[] | number) => {
    if (_.isArray(v)) {
      const curVal = _.last(v);
      if (curVal === DATASOURCE_ALL) {
        setFieldsValue({ datasource_ids: [DATASOURCE_ALL] });
      } else if (typeof v !== 'number' && v.includes(DATASOURCE_ALL)) {
        setFieldsValue({ datasource_ids: _.without(v, DATASOURCE_ALL) });
      }
    }
  };

  if (cate === 'prometheus' || cate === 'loki') {
    datasourceList = [
      {
        id: DATASOURCE_ALL,
        name: '$all',
      },
      ...datasourceList,
    ];
  }

  return (
    <Form.Item
      label={t('common:datasource.id')}
      name='datasource_ids'
      rules={[
        {
          required,
        },
      ]}
    >
      <Select mode={mode} onChange={handleClusterChange} maxTagCount='responsive' disabled={disabled} showSearch optionFilterProp='children'>
        {datasourceList?.map((item) => (
          <Select.Option value={item.id} key={item.id}>
            {item.name}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  );
}
