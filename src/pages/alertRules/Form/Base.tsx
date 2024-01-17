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
import { Form, Input, Select, Card, Row, Col, Tag, Tooltip } from 'antd';
import _ from 'lodash';
import { CommonStateContext } from '@/App';
import { panelBaseProps } from '../constants';

// 校验单个标签格式是否正确
function isTagValid(tag) {
  const contentRegExp = /^[a-zA-Z_][\w]*={1}[^=]+$/;
  return {
    isCorrectFormat: contentRegExp.test(tag.toString()),
    isLengthAllowed: tag.toString().length <= 64,
  };
}

export default function Base() {
  const { t } = useTranslation('alertRules');
  const { busiGroups } = useContext(CommonStateContext);
  const group_id = Form.useWatch('group_id');
  // 渲染标签
  function tagRender(content) {
    const { isCorrectFormat, isLengthAllowed } = isTagValid(content.value);
    return isCorrectFormat && isLengthAllowed ? (
      <Tag closable={content.closable} onClose={content.onClose}>
        {content.value}
      </Tag>
    ) : (
      <Tooltip title={isCorrectFormat ? t('append_tags_msg1') : t('append_tags_msg2')}>
        <Tag color='error' closable={content.closable} onClose={content.onClose} style={{ marginTop: '2px' }}>
          {content.value}
        </Tag>
      </Tooltip>
    );
  }

  // 校验所有标签格式
  function isValidFormat() {
    return {
      validator(_, value) {
        const isInvalid =
          value &&
          value.some((tag) => {
            const { isCorrectFormat, isLengthAllowed } = isTagValid(tag);
            if (!isCorrectFormat || !isLengthAllowed) {
              return true;
            }
          });
        return isInvalid ? Promise.reject(new Error(t('append_tags_msg'))) : Promise.resolve();
      },
    };
  }
  return (
    <Card {...panelBaseProps} title={t('basic_configs')}>
      <Row gutter={10}>
        <Col span={8}>
          <Form.Item label={t('name')} name='name' rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={t('append_tags')} name='append_tags' rules={[isValidFormat]} tooltip={t('append_tags_note_tip')}>
            <Select mode='tags' tokenSeparators={[' ']} open={false} placeholder={t('append_tags_placeholder')} tagRender={tagRender} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label={t('group_id')} name='group_id'>
            <div className='ant-form-text'>{_.find(busiGroups, { id: group_id })?.name}</div>
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item label={t('note')} name='note' tooltip={t('append_tags_note_tip')}>
            <Input.TextArea />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
}
