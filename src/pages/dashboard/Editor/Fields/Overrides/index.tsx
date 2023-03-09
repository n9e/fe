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
import { Form, Space, Select } from 'antd';
import { PlusCircleOutlined, MinusCircleOutlined, CaretDownOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Panel } from '../../Components/Collapse';
import ValueMappings from '../ValueMappings';
import StandardOptions from '../StandardOptions';

export default function index({ targets }) {
  const { t } = useTranslation('dashboard');
  const namePrefix = ['overrides'];

  return (
    <Form.List name={namePrefix}>
      {(fields, { add, remove }) =>
        fields.map(({ key, name, ...restField }) => {
          return (
            <Panel
              key={key}
              isInner
              header='override'
              extra={
                <Space>
                  <PlusCircleOutlined
                    onClick={() => {
                      add({
                        type: 'special',
                      });
                    }}
                  />
                  {fields.length > 1 && (
                    <MinusCircleOutlined
                      onClick={() => {
                        remove(name);
                      }}
                    />
                  )}
                </Space>
              }
            >
              <Form.Item label={t('panel.overrides.matcher')} {...restField} name={[name, 'matcher', 'value']}>
                <Select suffixIcon={<CaretDownOutlined />} allowClear>
                  {_.map(targets, (target) => {
                    return (
                      <Select.Option key={target.refId} value={target.refId}>
                        {target.refId}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
              <ValueMappings preNamePrefix={namePrefix} namePrefix={[name, 'properties', 'valueMappings']} />
              <StandardOptions preNamePrefix={namePrefix} namePrefix={[name, 'properties', 'standardOptions']} />
            </Panel>
          );
        })
      }
    </Form.List>
  );
}
