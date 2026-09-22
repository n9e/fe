import React from 'react';
import { Col, Form, Input, Row, Select, Space, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { ChannelItem } from '@/pages/notificationChannels/types';

import { NS } from '../../../constants';
import CredentialInput, { maskSecret } from './CredentialInput';

interface Props {
  prefixNamePath?: (string | number)[];
  field: FormListFieldData;
  channelItem?: ChannelItem;
}

const SEVERITIES = [1, 2, 3];
// 与后端 jsmDefaultPriority 一致；规则里只存改过的级别
const DEFAULT_PRIORITY: Record<string, string> = { '1': 'P1', '2': 'P2', '3': 'P3' };
const PRIORITY_OPTIONS = _.map(['P1', 'P2', 'P3', 'P4', 'P5'], (p) => ({ label: p, value: p }));

/**
 * JSM 告警的规则侧参数：API 集成的 key（决定告警归哪个团队）+ 名称 + 级别与优先级映射。
 * 与 Discord 的 Webhook 地址一样填在规则里，同一个媒介可以发给任意多个团队。
 */
export default function JSMAlert(props: Props) {
  const { t } = useTranslation(NS);
  const { field, channelItem, prefixNamePath = [] } = props;
  const paramsPath = [...prefixNamePath, field.name, 'params'];

  const label = (key: string) => (
    <Space size={4}>
      {t(`notification_configuration.jsm_alert.${key}`)}
      <Tooltip className='n9e-ant-from-item-tooltip' overlayClassName='ant-tooltip-max-width-600' title={t(`notification_configuration.jsm_alert.${key}_tip`)}>
        <QuestionCircleOutlined />
      </Tooltip>
    </Space>
  );

  return (
    <div>
      <Row gutter={16}>
        <Col span={16}>
          <Form.Item {...field} label={label('api_key')} name={[field.name, 'params', 'api_key']} rules={[{ required: true }]}>
            <CredentialInput
              channelId={channelItem?.id}
              paramsPath={paramsPath}
              credentialKey='api_key'
              mask={maskSecret}
              placeholder='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
              historyPlaceholder={t('notification_configuration.jsm_alert.api_key_history_placeholder')}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item {...field} label={label('bot_name')} name={[field.name, 'params', 'bot_name']}>
            <Input placeholder='SRE team' />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item {...field} label={label('priority_map')} name={[field.name, 'params', 'priority_map']}>
        <PriorityMapInput />
      </Form.Item>
    </div>
  );
}

function PriorityMapInput(props: { value?: string; onChange?: (v?: string) => void }) {
  const { value, onChange } = props;
  let custom: Record<string, string> = {};
  try {
    custom = value ? JSON.parse(value) ?? {} : {};
  } catch (e) {
    custom = {};
  }
  const current = { ...DEFAULT_PRIORITY, ...custom };
  const update = (sev: string, p: string) => {
    const next = { ...current, [sev]: p };
    // 和默认值一样的不存，全是默认时参数留空
    const diff = _.omitBy(next, (v, k) => DEFAULT_PRIORITY[k] === v);
    onChange?.(_.isEmpty(diff) ? undefined : JSON.stringify(diff));
  };

  return (
    <Space wrap>
      {_.map(SEVERITIES, (sev) => (
        <Space key={sev} size={4}>
          <span>S{sev}</span>
          <Select style={{ width: 90 }} options={PRIORITY_OPTIONS} value={current[String(sev)]} onChange={(p) => update(String(sev), p)} />
        </Space>
      ))}
    </Space>
  );
}
