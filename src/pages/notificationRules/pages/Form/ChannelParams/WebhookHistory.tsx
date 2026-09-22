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
 * Webhook 类媒介（Discord / Slack / Mattermost）的历史参数复用：列出本人所在团队的规则里
 * 这个媒介填过的参数组，选一条就把整组参数填回来，同一个频道只需填一次（同钉钉机器人）。
 * 数据来自 /notify-rule/custom-params，只回显媒介 param_config.custom.params 里声明过的 key。
 */
export default function WebhookHistory(props: Props) {
  const { t } = useTranslation(NS);
  const { channelId, paramsPath } = props;
  const form = Form.useFormInstance();
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (!channelId) {
      setItems([]);
      return;
    }
    getCustomParamsValues(channelId)
      .then((res: HistoryItem[]) => {
        setItems(_.filter(res, (item) => _.some(item, (p) => p.name === 'webhook_url' && p.value)));
      })
      .catch(() => setItems([]));
  }, [channelId]);

  if (_.isEmpty(items)) return null;

  const options = _.map(items, (item, idx) => {
    const get = (key: string) => _.find(item, (p) => p.name === key)?.value;
    const name = get('bot_name');
    const masked = maskWebhookURL(get('webhook_url'));
    return { value: idx, label: name ? `${name} · ${masked}` : masked };
  });

  return (
    <Form.Item label={t('notification_configuration.webhook_history.label')} tooltip={t('notification_configuration.webhook_history.tip')}>
      <Select
        allowClear
        showSearch
        optionFilterProp='label'
        placeholder={t('notification_configuration.webhook_history.placeholder')}
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
