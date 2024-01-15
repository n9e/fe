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
import { Form, Space, Switch, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface IProps {
  triggersKey: string;
}

export default function index(props: IProps) {
  const { t } = useTranslation('alertRules');
  const { triggersKey } = props;

  return (
    <Form.Item shouldUpdate noStyle>
      {({ getFieldValue, setFieldsValue }) => {
        const triggers = getFieldValue(['rule_config', triggersKey]);
        if (triggers && triggers.length > 1) {
          return (
            <Space>
              {t('inhibit')}
              <Tooltip title={t('inhibit_tip')}>
                <QuestionCircleOutlined />
              </Tooltip>
              <Switch
                checked={getFieldValue(['rule_config', 'inhibit'])}
                onChange={(checked) => {
                  setFieldsValue({
                    rule_config: {
                      inhibit: checked,
                    },
                  });
                }}
              />
            </Space>
          );
        }
      }}
    </Form.Item>
  );
}
