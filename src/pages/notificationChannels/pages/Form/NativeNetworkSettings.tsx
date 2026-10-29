import React, { useCallback, useState } from 'react';
import { Collapse, Form, Input, InputNumber, Space, Switch } from 'antd';
import { useTranslation } from 'react-i18next';

import { NS } from '../../constants';

interface Props {
  /** 媒介配置在表单里的路径，如 ['request_config', 'slackwebhook_request_config'] */
  names: string[];
  proxyTip: string;
  /** 自建服务（如 Mattermost）才需要跳过证书校验 */
  insecureTip?: string;
  /** 额外字段校验失败时调用 expand，避免错误被折叠隐藏。 */
  extra?: (expand: () => void) => React.ReactNode;
}

/** 原生媒介共用的「高级设置」：代理、超时、重试，按需加跳过证书校验。字段都不设 initialValue，原因见 Jira.tsx。 */
export default function NativeNetworkSettings({ names, proxyTip, insecureTip, extra }: Props) {
  const { t } = useTranslation(NS);
  const [activeKey, setActiveKey] = useState<string | string[]>([]);
  const expand = useCallback(() => setActiveKey(['advanced']), []);
  return (
    <Collapse ghost className='n9e-collapse-advanced-settings' activeKey={activeKey} onChange={setActiveKey}>
      <Collapse.Panel key='advanced' header={t('advanced_settings')} forceRender>
        {extra?.(expand)}
        <Form.Item label={t('http_request_config.proxy')} tooltip={proxyTip} name={[...names, 'proxy']}>
          <Input placeholder='http://127.0.0.1:7890' />
        </Form.Item>
        <Space>
          <Form.Item label={t('http_request_config.timeout')} name={[...names, 'timeout']}>
            <InputNumber min={1} className='w-full' />
          </Form.Item>
          <Form.Item label={t('http_request_config.retry_times')} name={[...names, 'retry_times']}>
            <InputNumber min={0} className='w-full' />
          </Form.Item>
          <Form.Item label={t('http_request_config.retry_interval')} name={[...names, 'retry_sleep']}>
            <InputNumber min={0} className='w-full' />
          </Form.Item>
        </Space>
        {insecureTip && (
          <Form.Item label={t('http_request_config.insecure_skip_verify')} tooltip={insecureTip} name={[...names, 'insecure_skip_verify']} valuePropName='checked'>
            <Switch />
          </Form.Item>
        )}
      </Collapse.Panel>
    </Collapse>
  );
}
