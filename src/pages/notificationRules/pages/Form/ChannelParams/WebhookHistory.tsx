import React, { useEffect, useState } from 'react';
import { Form, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { getCustomParamsValues } from '../../../services';
import { NS } from '../../../constants';

interface Props {
  channelId?: number;
  /** 本条通知配置 params 的绝对路径，如 ['notify_configs', 0, 'params'] */
  paramsPath: (string | number)[];
  /** 凭证参数的 key，默认 webhook_url；JSM 是 api_key */
  credentialKey?: string;
  /** 下拉里凭证的掩码方式，默认按 Webhook 地址掩码 */
  mask?: (raw?: string) => string;
  /** 文案所在的 locale 分组，默认 webhook_history */
  i18nKey?: string;
}

type HistoryItem = { name: string; cname: string; value: string }[];

/** Webhook 地址的路径最后一段就是凭证，下拉里只显示掩码 */
export function maskWebhookURL(raw?: string): string {
  if (!raw) return '';
  const m = raw.match(/^(https?:\/\/[^/]+)(\/.*)?$/i);
  if (!m) return '***';
  const path = _.trimEnd(m[2] || '', '/');
  const idx = path.lastIndexOf('/');
  return idx >= 0 ? `${m[1]}${path.slice(0, idx + 1)}***` : `${m[1]}/***`;
}

/**
 * Webhook 类媒介（Discord / Slack / Mattermost）与 JSM 告警的历史参数复用：列出本人所在团队的规则里
 * 这个媒介填过的参数组，选一条就把整组参数填回来，同一个频道只需填一次（同钉钉机器人）。
 * 数据来自 /notify-rule/custom-params，只回显媒介 param_config.custom.params 里声明过的 key。
 */
/** API key 之类的凭证只留最后 4 位 */
export function maskSecret(raw?: string): string {
  const v = _.trim(raw);
  if (!v) return '';
  return v.length <= 4 ? '***' : `***${v.slice(-4)}`;
}

export default function WebhookHistory(props: Props) {
  const { t } = useTranslation(NS);
  const { channelId, paramsPath, credentialKey = 'webhook_url', mask = maskWebhookURL, i18nKey = 'webhook_history' } = props;
  const form = Form.useFormInstance();
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (!channelId) {
      setItems([]);
      return;
    }
    getCustomParamsValues(channelId)
      .then((res: HistoryItem[]) => {
        setItems(_.filter(res, (item) => _.some(item, (p) => p.name === credentialKey && p.value)));
      })
      .catch(() => setItems([]));
  }, [channelId, credentialKey]);

  if (_.isEmpty(items)) return null;

  const options = _.map(items, (item, idx) => {
    const get = (key: string) => _.find(item, (p) => p.name === key)?.value;
    const name = get('bot_name');
    const masked = mask(get(credentialKey));
    return { value: idx, label: name ? `${name} · ${masked}` : masked };
  });

  return (
    <Form.Item label={t(`notification_configuration.${i18nKey}.label`)} tooltip={t(`notification_configuration.${i18nKey}.tip`)}>
      <Select
        allowClear
        showSearch
        optionFilterProp='label'
        placeholder={t(`notification_configuration.${i18nKey}.placeholder`)}
        options={options}
        value={null}
        onChange={(idx?: number) => {
          if (idx === undefined || idx === null) return;
          form.setFields(_.map(items[idx], (p) => ({ name: [...paramsPath, p.name], value: p.value })));
        }}
      />
    </Form.Item>
  );
}
