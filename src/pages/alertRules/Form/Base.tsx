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
import { useTranslation } from 'react-i18next';
import { Form, Input, Card, Row, Col, Space } from 'antd';
import _ from 'lodash';

import { CommonStateContext } from '@/App';
import { HelpLink } from '@/components/pageLayout';
import KVTagSelect, { validatorOfKVTagSelect } from '@/components/KVTagSelect';

import { panelBaseProps } from '../constants';

export default function Base() {
  const { t } = useTranslation('alertRules');
  const { busiGroups } = useContext(CommonStateContext);
  const group_id = Form.useWatch('group_id');

  return (
    <Card
      {...panelBaseProps}
      title={
        <Space>
          {t('basic_configs')}
          <HelpLink src='https://flashcat.cloud/docs/content/flashcat-monitor/nightingale-v7/usage/alert/alert-rules/alert-basic-conf/' />
        </Space>
      }
    >
      <Row gutter={10}>
        <Col span={8}>
          <Form.Item label={t('name')} name='name' rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={t('append_tags')} name='append_tags' rules={[validatorOfKVTagSelect]} tooltip={t('append_tags_note_tip')}>
            <KVTagSelect />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={t('group_id')} name='group_id'>
            <div className='ant-form-text'>{_.find(busiGroups, { id: group_id })?.name}</div>
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label={t('note')} name='note'>
            <Input.TextArea autoSize />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
}
