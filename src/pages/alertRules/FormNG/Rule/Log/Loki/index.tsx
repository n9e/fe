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

import React, { useContext } from 'react';
import { Form, Space, Button, Tooltip } from 'antd';
import { LokiMonacoEditor } from '@fc-components/monaco-editor';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import DocumentDrawer from '@/components/DocumentDrawer';
import { IS_PLUS } from '@/utils/constant';
import { FormStateContext } from '@/pages/alertRules/Form';
import InputGroupWithFormItem from '@/components/InputGroupWithFormItem';
import Severity from '@/pages/alertRules/Form/components/Severity';
import Inhibit from '@/pages/alertRules/Form/components/Inhibit';
import AdvancedSettings from '@/pages/alertRules/Form/Rule/Rule/Metric/Prometheus/components/AdvancedSettings';
import CardContainer, { CardContainerHeader } from '@/pages/alertRules/FormNG/components/CardContainer';
import FormItemLabel from '@/pages/alertRules/FormNG/components/FormItemLabel';

export default function index(props: { datasourceCate: string; datasourceValue: number[] }) {
  const { t, i18n } = useTranslation('alertRules');
  const { darkMode } = useContext(CommonStateContext);
  const { disabled } = useContext(FormStateContext);

  return (
    <Form.List name={['rule_config', 'queries']}>
      {(fields, { add, remove }) => (
        <div>
          <FormItemLabel>
            <Space>
              {t('metric.query.title')}
              <Inhibit triggersKey='queries' />
            </Space>
          </FormItemLabel>
          {fields.map((field) => (
            <CardContainer key={field.key} onClose={fields.length > 1 ? () => remove(field.name) : undefined}>
              <CardContainerHeader>
                <InputGroupWithFormItem
                  label={
                    <Space>
                      {'LogQL'}
                      <Tooltip title={t('common:click_to_view_doc')}>
                        <QuestionCircleOutlined
                          onClick={() => {
                            DocumentDrawer({
                              language: i18n.language,
                              darkMode,
                              title: t('common:page_help'),
                              type: 'iframe',
                              documentPath: 'https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v9/usage/alert-notify/rules/alert-rules/query-data/loki/',
                            });
                          }}
                        />
                      </Tooltip>
                    </Space>
                  }
                >
                  <Form.Item
                    {...field}
                    name={[field.name, 'prom_ql']} //页面上展示LogQL，实际还是存prom_ql
                    validateTrigger={['onBlur']}
                    trigger='onChange'
                    rules={[{ required: true, message: t('loki.required') }]}
                  >
                    <LokiMonacoEditor
                      theme={darkMode ? 'dark' : 'light'}
                      placeholder='Input LogQL to query, press Shift+Enter for newlines'
                      readOnly={disabled}
                      enableAutocomplete
                    />
                  </Form.Item>
                </InputGroupWithFormItem>
              </CardContainerHeader>
              <div className='mb-4'>
                <Severity field={field} />
              </div>
              {IS_PLUS && <AdvancedSettings field={field} />}
            </CardContainer>
          ))}
          <Button
            className='w-full'
            type='dashed'
            onClick={() =>
              add({
                prom_ql: '',
                severity: 2,
              })
            }
            icon={<PlusOutlined />}
          >
            {t('metric.query.title')}
          </Button>
        </div>
      )}
    </Form.List>
  );
}
