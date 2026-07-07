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
import { Space, Form, Radio } from 'antd';
import { useTranslation } from 'react-i18next';

const bgColorMap: Record<string, string> = {
  S1: 'var(--fc-red-9)',
  S2: 'var(--fc-orange-9)',
  S3: 'var(--fc-yellow-9)',
};

const severityOptions = [1, 2, 3] as const;

export default function index({ field, disabled, validateDisabled }: { field: any; disabled?: boolean; validateDisabled?: boolean }) {
  const { t } = useTranslation('alertRules');
  return (
    <Space align='baseline'>
      {t('severity_label')}
      <Form.Item {...field} name={[field.name, 'severity']} rules={validateDisabled ? [] : [{ required: true, message: 'Missing severity' }]} noStyle>
        <Radio.Group disabled={disabled}>
          {severityOptions.map((value) => (
            <Radio key={value} value={value}>
              <div className='relative top-[-2px]'>
                <span className='inline-block w-2 h-2 rounded-full mr-1' style={{ backgroundColor: bgColorMap[`S${value}`] }} />
                {t(`common:severity.${value}`)}
              </div>
            </Radio>
          ))}
        </Radio.Group>
      </Form.Item>
    </Space>
  );
}
