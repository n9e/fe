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
import { Form, Row, Col, Select, InputNumber, Mentions } from 'antd';
import _ from 'lodash';
import { useTranslation, Trans } from 'react-i18next';
import { Panel } from '../../Components/Collapse';
import ColorPicker from '../../../Components/ColorPicker';

export default function GraphStyles({ variableConfigWithOptions }) {
  const { t } = useTranslation('dashboard');
  const namePrefix = ['custom'];

  return (
    <Panel header={t('panel.custom.title')}>
      <Row gutter={10}>
        <Col span={3}>
          <Form.Item label={t('panel.custom.text.textColor')} name={[...namePrefix, 'textColor']}>
            <ColorPicker />
          </Form.Item>
        </Col>
        <Col span={3}>
          <Form.Item label={t('panel.custom.text.bgColor')} name={[...namePrefix, 'bgColor']}>
            <ColorPicker />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label={t('panel.custom.text.textSize')} name={[...namePrefix, 'textSize']}>
            <InputNumber />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label={t('panel.custom.text.justifyContent.name')} name={[...namePrefix, 'justifyContent']}>
            <Select>
              <Select.Option value='unset'>{t('panel.custom.text.justifyContent.unset')}</Select.Option>
              <Select.Option value='flexStart'>{t('panel.custom.text.justifyContent.flexStart')}</Select.Option>
              <Select.Option value='center'>{t('panel.custom.text.justifyContent.flexStart')}</Select.Option>
              <Select.Option value='flexEnd'>{t('panel.custom.text.justifyContent.flexStart')}</Select.Option>
            </Select>
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label={t('panel.custom.text.alignItems.name')} name={[...namePrefix, 'alignItems']}>
            <Select>
              <Select.Option value='unset'>{t('panel.custom.text.alignItems.unset')}</Select.Option>
              <Select.Option value='flexStart'>{t('panel.custom.text.alignItems.flexStart')}</Select.Option>
              <Select.Option value='center'>{t('panel.custom.text.alignItems.center')}</Select.Option>
              <Select.Option value='flexEnd'>{t('panel.custom.text.alignItems.flexEnd')}</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Form.Item
        label={t('panel.custom.text.content')}
        tooltip={
          <Trans ns='dashboard' i18nKey='panel.custom.text.content_tip'>
            <div></div>
            <div></div>
            <div></div>
          </Trans>
        }
        name={[...namePrefix, 'content']}
      >
        <Mentions prefix='$' rows={3} placeholder={t('panel.custom.text.content_placeholder')}>
          {_.map(variableConfigWithOptions, (item) => {
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
