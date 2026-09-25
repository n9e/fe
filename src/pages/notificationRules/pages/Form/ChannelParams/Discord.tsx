import React from 'react';
import { Col, Form, Input, Row, Select, Space, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { ChannelItem } from '@/pages/notificationChannels/types';

import { NS } from '../../../constants';
import CredentialInput, { maskWebhookURL } from './CredentialInput';

interface Props {
  prefixNamePath?: (string | number)[];
  field: FormListFieldData;
  channelItem?: ChannelItem;
}

// 与后端校验一致：http(s) 且路径含 /webhooks/，允许经反向代理或网关转发的地址
const DISCORD_WEBHOOK_RE = /^https?:\/\/[^/]+\/.*webhooks\/[^/]+\/[^/]+/i;
const isVarRef = (v?: string) => !!v && v.includes('{{');

/**
 * Discord 规则侧参数：Webhook 地址（一个地址对应一个频道）+ 名称 + 发送目标。
 * 与钉钉机器人的 token 一样填在规则里，同一个媒介可以发到任意多个频道。
 */
export default function Discord(props: Props) {
  const { t } = useTranslation(NS);
  const { field, channelItem, prefixNamePath = [] } = props;
  const paramsPath = [...prefixNamePath, field.name, 'params'];
  const target: string | undefined = Form.useWatch([...paramsPath, 'target']);

  const label = (key: string) => (
    <Space size={4}>
      {t(`notification_configuration.discord.${key}`)}
      <Tooltip
        className='n9e-ant-from-item-tooltip'
        overlayClassName='ant-tooltip-max-width-600'
        title={<div className='whitespace-pre-line'>{t(`notification_configuration.discord.${key}_tip`)}</div>}
      >
        <QuestionCircleOutlined />
      </Tooltip>
    </Space>
  );

  return (
    <div>
      <Row gutter={16}>
        <Col span={16}>
          <Form.Item
            {...field}
            label={label('webhook_url')}
            messageVariables={{ label: t('notification_configuration.discord.webhook_url') }}
            name={[field.name, 'params', 'webhook_url']}
            validateTrigger='onBlur'
            rules={[
              { required: true },
              {
                validator: (_rule, value?: string) => {
                  if (!value || isVarRef(value) || DISCORD_WEBHOOK_RE.test(_.trim(value))) return Promise.resolve();
                  return Promise.reject(new Error(t('notification_configuration.discord.webhook_url_invalid')));
                },
              },
            ]}
          >
            <CredentialInput
              channelId={channelItem?.id}
              paramsPath={paramsPath}
              credentialKey='webhook_url'
              mask={maskWebhookURL}
              placeholder='https://discord.com/api/webhooks/<id>/<token>'
              historyPlaceholder={t('notification_configuration.discord.webhook_url_history_placeholder')}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item {...field} label={label('bot_name')} name={[field.name, 'params', 'bot_name']}>
            <Input placeholder='#prod-alerts' />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item {...field} label={label('target')} name={[field.name, 'params', 'target']} getValueProps={(v) => ({ value: v || 'channel' })}>
            <Select
              options={[
                { label: t('notification_configuration.discord.target_channel'), value: 'channel' },
                { label: t('notification_configuration.discord.target_forum_post'), value: 'forum_post' },
                { label: t('notification_configuration.discord.target_thread'), value: 'thread' },
              ]}
            />
          </Form.Item>
        </Col>
        {target === 'forum_post' && (
          <Col span={16}>
            <Form.Item
              {...field}
              label={label('thread_name')}
              messageVariables={{ label: t('notification_configuration.discord.thread_name') }}
              name={[field.name, 'params', 'thread_name']}
              rules={[{ required: true }]}
            >
              <Input placeholder='{{$event.RuleName}}' />
            </Form.Item>
          </Col>
        )}
        {target === 'thread' && (
          <Col span={16}>
            <Form.Item
              {...field}
              label={label('thread_id')}
              messageVariables={{ label: t('notification_configuration.discord.thread_id') }}
              name={[field.name, 'params', 'thread_id']}
              rules={[{ required: true }, { pattern: /^\d+$/, message: t('notification_configuration.discord.thread_id_invalid') }]}
            >
              <Input placeholder='1177566663751782411' />
            </Form.Item>
          </Col>
        )}
      </Row>
    </div>
  );
}
