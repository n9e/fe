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

export default function index({ field, disabled }: { field: any; disabled?: boolean }) {
  const { t } = useTranslation('alertRules');
  return (
    <Space align='baseline'>
      {t('severity_label')}：
      <Form.Item {...field} name={[field.name, 'severity']} rules={[{ required: true, message: 'Missing severity' }]} noStyle>
        <Radio.Group disabled={disabled}>
          <Radio value={1}>{t('common:severity.1')}</Radio>
          <Radio value={2}>{t('common:severity.2')}</Radio>
          <Radio value={3}>{t('common:severity.3')}</Radio>
        </Radio.Group>
      </Form.Item>
    </Space>
  );
}
