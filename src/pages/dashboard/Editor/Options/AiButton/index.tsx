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
import { Button, Form, Input, Select, Space, Switch } from 'antd';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import AiCircleIcon from '@/pages/dashboard/Components/AiCircleIcon';
import PromptEditor from '@/components/AiChat/PromptEditor';
import { useGlobalState } from '@/pages/dashboard/globalState';
import { IS_ENT } from '@/utils/constant';

import { Panel } from '../../Components/Collapse';
import type { IAiButtonStyles } from '../../../types';

const DEFAULT_LABEL = IS_ENT ? 'FlashAI' : 'Nightingale AI';
const BUTTON_STYLES = ['capsule', 'icon', 'antd'] as const;

function StylePreview({ style }: { style: IAiButtonStyles['style'] }) {
  if (style === 'icon') {
    return <AiCircleIcon />;
  }

  if (style === 'antd') {
    return (
      <Button size='small' type='primary' tabIndex={-1} className='!h-6 !px-2 !text-xs'>
        {DEFAULT_LABEL}
      </Button>
    );
  }

  return (
    <Button
      size='small'
      tabIndex={-1}
      icon={<img src='/image/ai-chat/ai.gif' alt='' className='mr-1 h-3 w-3' />}
      className='!h-6 !rounded-full !px-2 !text-xs border-violet-600 bg-violet-300 text-violet-1100 hover:border-violet-700 hover:bg-violet-400'
    >
      {DEFAULT_LABEL}
    </Button>
  );
}

function StylePicker({ value, onChange }: { value?: IAiButtonStyles['style']; onChange?: (value: IAiButtonStyles['style']) => void }) {
  const { t } = useTranslation('dashboard');
  const selected = value === 'icon' || value === 'antd' ? value : 'capsule';

  return (
    <div role='radiogroup' className='grid grid-cols-3 gap-2'>
      {BUTTON_STYLES.map((style) => {
        const checked = selected === style;
        return (
          <div
            key={style}
            role='radio'
            aria-checked={checked}
            aria-label={t(`panel.custom.aiButton.style_${style}`)}
            tabIndex={0}
            className={`flex h-20 cursor-pointer items-center justify-center overflow-hidden rounded-lg border bg-transparent px-2 transition-colors hover:border-[var(--fc-primary-color)] hover:bg-fc-200 ${
              checked ? 'border-[var(--fc-primary-color)]' : 'border-[var(--fc-border-color)]'
            }`}
            onClick={() => onChange?.(style)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onChange?.(style);
              }
            }}
          >
            <div className='pointer-events-none'>
              <StylePreview style={style} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AiButtonOptions() {
  const { t } = useTranslation('dashboard');
  const namePrefix = ['custom'];
  const [variablesWithOptions] = useGlobalState('variablesWithOptions');
  const form = Form.useFormInstance();
  const references = Form.useWatch(['custom', 'promptReferences'], form);

  return (
    <Panel header={t('panel.custom.title')}>
      <Form.Item label={t('panel.custom.aiButton.style')} name={[...namePrefix, 'style']}>
        <StylePicker />
      </Form.Item>
      <Form.Item noStyle shouldUpdate={(prevValues, curValues) => _.get(prevValues, [...namePrefix, 'style']) !== _.get(curValues, [...namePrefix, 'style'])}>
        {({ getFieldValue }) => {
          const style = getFieldValue([...namePrefix, 'style']);
          return (
            <>
              <Form.Item label={t('panel.custom.aiButton.text')} tooltip={t('panel.custom.aiButton.text_tip')} name={[...namePrefix, 'text']}>
                <Input placeholder={t('panel.custom.aiButton.text_placeholder', { name: DEFAULT_LABEL })} />
              </Form.Item>
              {style === 'antd' ? (
                <Form.Item label={t('panel.custom.aiButton.type')} name={[...namePrefix, 'type']}>
                  <Select
                    options={[
                      { label: 'primary', value: 'primary' },
                      { label: 'default', value: 'default' },
                      { label: 'dashed', value: 'dashed' },
                      { label: 'text', value: 'text' },
                      { label: 'link', value: 'link' },
                    ]}
                  />
                </Form.Item>
              ) : null}
            </>
          );
        }}
      </Form.Item>
      <Space align='start'>
        <Form.Item label={t('panel.custom.aiButton.size')} name={[...namePrefix, 'size']}>
          <Select style={{ width: 100 }} options={['small', 'middle', 'large'].map((size) => ({ label: t(`panel.custom.aiButton.size_${size}`), value: size }))} />
        </Form.Item>
        <Form.Item label={t('panel.custom.aiButton.autoExecute')} name={[...namePrefix, 'autoExecute']} valuePropName='checked'>
          <Switch />
        </Form.Item>
        <Form.Item label={t('panel.custom.aiButton.reuseConversation')} name={[...namePrefix, 'reuseConversation']} valuePropName='checked'>
          <Switch />
        </Form.Item>
      </Space>
      <Form.Item name={[...namePrefix, 'promptReferences']} hidden>
        <Input />
      </Form.Item>
      <Form.Item
        label={t('panel.custom.aiButton.prompt')}
        tooltip={{
          overlayStyle: { maxWidth: 'min(480px, calc(100vw - 32px))' },
          title: (
            <div>
              <div className='font-semibold'>{t('panel.custom.aiButton.prompt_variables_title')}</div>
              <div style={{ whiteSpace: 'pre-line' }}>{t('panel.custom.aiButton.prompt_variables_tip')}</div>
            </div>
          ),
        }}
        name={[...namePrefix, 'prompt']}
      >
        <PromptEditor
          variableNames={_.map(variablesWithOptions, (item) => item.name)}
          references={references}
          onReferencesChange={(promptReferences) => form.setFieldsValue({ custom: { promptReferences } })}
        />
      </Form.Item>
    </Panel>
  );
}
