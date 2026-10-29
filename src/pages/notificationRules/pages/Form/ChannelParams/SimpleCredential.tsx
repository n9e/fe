import React from 'react';
import { Col, Form, Input, Row, Space, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { ChannelItem } from '@/pages/notificationChannels/types';

import { NS } from '../../../constants';
import CredentialInput, { maskSecret } from './CredentialInput';

export type SimpleCredentialType = 'pushover' | 'ntfy' | 'splunk_oncall' | 'line';

// 与后端各 provider 的校验一致
export const SIMPLE_CREDENTIAL_RULES: Record<SimpleCredentialType, { key: string; pattern: RegExp; placeholder: string; namePlaceholder: string; mask: (raw?: string) => string }> =
  {
    // User Key / Group Key：30 位字母数字，可以逗号分隔多个
    pushover: {
      key: 'user_key',
      pattern: /^[A-Za-z0-9]{30}(\s*,\s*[A-Za-z0-9]{30})*$/,
      placeholder: 'uQiRzpo4DXghDmr9QzzfQu27cmVRsG',
      namePlaceholder: 'On-call group',
      mask: maskSecret,
    },
    // 公共服务上 Topic 等同于密码，下拉里按凭证掩码
    ntfy: { key: 'topic', pattern: /^[-_A-Za-z0-9]{1,64}$/, placeholder: 'ops-alerts-x7Kq2', namePlaceholder: 'Ops alerts', mask: maskSecret },
    // Routing Key 是团队路由的名字，不是凭证，原样显示
    splunk_oncall: { key: 'routing_key', pattern: /^[^\s/?#]+$/, placeholder: 'database', namePlaceholder: 'DB team', mask: (raw) => _.trim(raw) },
    line: { key: 'to', pattern: /^[UCR][0-9a-f]{32}$/, placeholder: 'U4af4980629...', namePlaceholder: 'Ops group', mask: maskSecret },
  };
const isVarRef = (v?: string) => !!v && v.includes('{{');

interface Props {
  prefixNamePath?: (string | number)[];
  field: FormListFieldData;
  channelItem?: ChannelItem;
  requestType: SimpleCredentialType;
}

/**
 * Pushover / ntfy / Splunk On-Call / LINE 的规则侧参数：一个「发给谁」的值（User Key、Topic、Routing Key、接收方 ID）+ 名称。
 * 与 Slack 的 Webhook 地址一样填在规则里，同一个媒介可以发给任意多个接收方。
 */
export default function SimpleCredential(props: Props) {
  const { t } = useTranslation(NS);
  const { field, channelItem, prefixNamePath = [], requestType } = props;
  const paramsPath = [...prefixNamePath, field.name, 'params'];
  const rule = SIMPLE_CREDENTIAL_RULES[requestType];
  const k = (key: string) => `notification_configuration.${requestType}.${key}`;
  const shared = (key: string) => `notification_configuration.native_param.${key}`;

  const label = (text: string, tip: string) => (
    <Space size={4}>
      {text}
      <Tooltip className='n9e-ant-from-item-tooltip' overlayClassName='ant-tooltip-max-width-600' title={<div className='whitespace-pre-line'>{tip}</div>}>
        <QuestionCircleOutlined />
      </Tooltip>
    </Space>
  );

  return (
    <Row gutter={16}>
      <Col span={16}>
        <Form.Item
          {...field}
          label={label(t(k(rule.key)), t(k(`${rule.key}_tip`)))}
          messageVariables={{ label: t(k(rule.key)) }}
          name={[field.name, 'params', rule.key]}
          validateTrigger='onBlur'
          rules={[
            { required: true },
            {
              validator: (_rule, value?: string) => {
                if (!value || isVarRef(value) || rule.pattern.test(_.trim(value))) return Promise.resolve();
                return Promise.reject(new Error(t(k(`${rule.key}_invalid`))));
              },
            },
          ]}
        >
          <CredentialInput
            channelId={channelItem?.id}
            paramsPath={paramsPath}
            credentialKey={rule.key}
            mask={rule.mask}
            placeholder={rule.placeholder}
            historyPlaceholder={t(shared('history_placeholder'))}
          />
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item {...field} label={label(t(shared('bot_name')), t(shared('bot_name_tip')))} name={[field.name, 'params', 'bot_name']}>
          <Input placeholder={rule.namePlaceholder} />
        </Form.Item>
      </Col>
    </Row>
  );
}
