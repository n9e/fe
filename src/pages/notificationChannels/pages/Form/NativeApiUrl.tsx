import React from 'react';
import { Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';

import { NS } from '../../constants';

interface Props {
  /** 字段在表单里的完整路径，如 ['request_config', 'line_request_config', 'api_url'] */
  name: string[];
  /** 官方地址，作为占位符显示 */
  defaultUrl: string;
  active: boolean;
  label?: string;
  tip?: string;
}

/** 原生媒介可选的接口地址：留空用官方地址，只有经网关或反向代理访问时才需要改。不设 initialValue，原因见 Jira.tsx。 */
export default function NativeApiUrl({ name, defaultUrl, active, label, tip }: Props) {
  const { t } = useTranslation(NS);
  return (
    <Form.Item
      label={label ?? t('native_api_url')}
      tooltip={tip ?? t('native_api_url_tip')}
      name={name}
      rules={[
        {
          validator: (_rule, value?: string) => {
            if (!active || !value || value.includes('{{') || /^https?:\/\/\S+$/i.test(value.trim())) return Promise.resolve();
            return Promise.reject(new Error(t('native_api_url_invalid')));
          },
        },
      ]}
    >
      <Input placeholder={defaultUrl} />
    </Form.Item>
  );
}
