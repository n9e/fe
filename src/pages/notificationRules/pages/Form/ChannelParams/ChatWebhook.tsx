import React from 'react';
import { Col, Form, Input, Row, Space, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { ChannelItem } from '@/pages/notificationChannels/types';

import { NS } from '../../../constants';
import CredentialInput, { maskWebhookURL } from './CredentialInput';

// 与后端校验一致：http(s) 且路径含固定的一段，不限域名，经反向代理或网关转发的地址也要能填
const WEBHOOK_RULES: Record<string, { pattern: RegExp; placeholder: string; namePlaceholder: string }> = {
  slackwebhook: { pattern: /^https?:\/\/[^/]+\/.*services\/.+/i, placeholder: 'https://hooks.slack.com/services/T.../B.../...', namePlaceholder: '#ops-alerts' },
  mattermostwebhook: { pattern: /^https?:\/\/[^/]+\/.*hooks\/.+/i, placeholder: 'https://mattermost.example.com/hooks/<id>', namePlaceholder: '#ops' },
};
const isVarRef = (v?: string) => !!v && v.includes('{{');

interface Props {
  prefixNamePath?: (string | number)[];
  field: FormListFieldData;
  channelItem?: ChannelItem;
  requestType: 'slackwebhook' | 'mattermostwebhook';
}

/**
 * Slack / Mattermost Webhook 的规则侧参数：Webhook 地址（一个地址对应一个频道）+ 名称。
 * 与钉钉机器人的 token 一样填在规则里，同一个媒介可以发到任意多个频道。
 */
export default function ChatWebhook(props: Props) {
  const { t } = useTranslation(NS);
  const { field, channelItem, prefixNamePath = [], requestType } = props;
  const paramsPath = [...prefixNamePath, field.name, 'params'];
  const rule = WEBHOOK_RULES[requestType];
  const k = (key: string) => `notification_configuration.${requestType}.${key}`;

  const label = (key: string) => (
    <Space size={4}>
      {t(k(key))}
      <Tooltip className='n9e-ant-from-item-tooltip' overlayClassName='ant-tooltip-max-width-600' title={<div className='whitespace-pre-line'>{t(k(`${key}_tip`))}</div>}>
        <QuestionCircleOutlined />
      </Tooltip>
    </Space>
  );

  return (
    <Row gutter={16}>
      <Col span={16}>
        <Form.Item
          {...field}
          label={label('webhook_url')}
          messageVariables={{ label: t(k('webhook_url')) }}
          name={[field.name, 'params', 'webhook_url']}
          validateTrigger='onBlur'
          rules={[
            { required: true },
            {
              validator: (_rule, value?: string) => {
                if (!value || isVarRef(value) || rule.pattern.test(_.trim(value))) return Promise.resolve();
                return Promise.reject(new Error(t(k('webhook_url_invalid'))));
              },
            },
          ]}
        >
          <CredentialInput
            channelId={channelItem?.id}
            paramsPath={paramsPath}
            credentialKey='webhook_url'
            mask={maskWebhookURL}
            placeholder={rule.placeholder}
            historyPlaceholder={t(k('webhook_url_history_placeholder'))}
          />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item {...field} label={label('bot_name')} name={[field.name, 'params', 'bot_name']}>
          <Input placeholder={rule.namePlaceholder} />
        </Form.Item>
      </Col>
    </Row>
  );
}
