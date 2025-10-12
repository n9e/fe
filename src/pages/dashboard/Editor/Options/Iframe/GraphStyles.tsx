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
import { Form, Mentions } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { useGlobalState } from '@/pages/dashboard/globalState';

import { Panel } from '../../Components/Collapse';

export default function GraphStyles() {
  const { t } = useTranslation('dashboard');
  const namePrefix = ['custom'];
  const [variablesWithOptions] = useGlobalState('variablesWithOptions');

  return (
    <Panel header={t('panel.custom.title')}>
      <Form.Item label={t('panel.custom.iframe.src')} name={[...namePrefix, 'src']}>
        <Mentions
          prefix='$'
          autoSize={{
            minRows: 1,
            maxRows: 6,
          }}
        >
          {_.map(variablesWithOptions, (item) => {
            return (
              <Mentions.Option key={item.name} value={item.name}>
                {item.name}
              </Mentions.Option>
            );
          })}
        </Mentions>
      </Form.Item>
    </Panel>
  );
}
