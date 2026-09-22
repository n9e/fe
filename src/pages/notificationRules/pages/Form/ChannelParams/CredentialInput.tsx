import React, { useEffect, useMemo, useState } from 'react';
import { AutoComplete, Form, Input } from 'antd';
import _ from 'lodash';

import { getCustomParamsValues } from '../../../services';

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

/** API key 之类的凭证只留最后 4 位 */
export function maskSecret(raw?: string): string {
  const v = _.trim(raw);
  if (!v) return '';
  return v.length <= 4 ? '***' : `***${v.slice(-4)}`;
}

// 下拉选项的值只是序号，真实凭证不进下拉的 DOM
const OPTION_PREFIX = '__n9e_credential_history_';

interface Props {
  /** Form.Item 注入：id 供 label 关联，onBlur 触发失焦校验 */
  id?: string;
  value?: string;
  onChange?: (value?: string) => void;
  onBlur?: React.FocusEventHandler<HTMLElement>;
  channelId?: number;
  /** 本条通知配置 params 的绝对路径，如 ['notify_configs', 0, 'params'] */
  paramsPath: (string | number)[];
  /** 凭证参数的 key：Discord 是 webhook_url，JSM 是 api_key */
  credentialKey: string;
  /** 下拉里凭证的掩码方式 */
  mask: (raw?: string) => string;
  /** 没有历史参数时的占位符 */
  placeholder?: string;
  /** 有历史参数时的占位符，提示可以点开选择 */
  historyPlaceholder?: string;
}

/**
 * 凭证输入框（Webhook 地址 / API key），同钉钉机器人的 token：点开输入框就能选本人所在团队的规则里
 * 这个媒介填过的参数组，选一条把整组参数填回来，同一个频道 / 团队只需填一次。
 * 与钉钉不同的是凭证保持掩码：输入框是密码框，下拉只显示「名称 · 掩码」。
 * 历史数据来自 /notify-rule/custom-params，只回显媒介 param_config.custom.params 里声明过的 key。
 */
export default function CredentialInput(props: Props) {
  const { id, value, onChange, onBlur, channelId, paramsPath, credentialKey, mask, placeholder, historyPlaceholder } = props;
  const form = Form.useFormInstance();
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (!channelId) {
      setItems([]);
      return;
    }
    let alive = true;
    getCustomParamsValues(channelId)
      .then((res: HistoryItem[]) => {
        if (alive) setItems(_.filter(res, (item) => _.some(item, (p) => p.name === credentialKey && p.value)));
      })
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, [channelId, credentialKey]);

  const options = useMemo(
    () =>
      _.map(items, (item, idx) => {
        const get = (key: string) => _.find(item, (p) => p.name === key)?.value;
        const name = get('bot_name');
        const masked = mask(get(credentialKey));
        return { value: `${OPTION_PREFIX}${idx}`, label: name ? `${name} · ${masked}` : masked };
      }),
    [items, credentialKey, mask],
  );

  const handleChange = (next?: string) => {
    const idx = _.startsWith(next, OPTION_PREFIX) ? _.toNumber(String(next).slice(OPTION_PREFIX.length)) : NaN;
    if (!_.isNaN(idx) && items[idx]) {
      const names = _.map(items[idx], (p) => [...paramsPath, p.name]);
      form.setFields(_.map(items[idx], (p, i) => ({ name: names[i], value: p.value })));
      // setFields 只改值不重新校验：换 key 要先清空输入框，那一下留下的「必填」报错会一直挂着，这里按新值重新校验
      form.validateFields(names).catch(() => {});
      return;
    }
    onChange?.(next);
  };

  return (
    <AutoComplete
      id={id}
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      options={options}
      // 输入框为空时列出全部；输入时按名称过滤，粘贴新凭证时下拉自然收起
      filterOption={(input, option) => !input || _.includes(_.toLower(String(option?.label)), _.toLower(input))}
      style={{ width: '100%' }}
    >
      <Input.Password autoComplete='new-password' placeholder={_.isEmpty(options) ? placeholder : historyPlaceholder || placeholder} />
    </AutoComplete>
  );
}
