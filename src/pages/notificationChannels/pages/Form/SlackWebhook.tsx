import React from 'react';
import { Alert, Form } from 'antd';
import { useTranslation } from 'react-i18next';

import { NS } from '../../constants';
import NativeNetworkSettings from './NativeNetworkSettings';

/**
 * Slack Webhook 媒介只有网络设置：Webhook 地址（一个地址对应一个频道）在通知规则里填，与钉钉机器人的 token 一样。
 * 新版 Slack 应用的 Webhook 会忽略名称、图标的覆盖，所以不提供外观设置。
 */
export default function SlackWebhook() {
  const { t } = useTranslation(NS);
  const request_type = Form.useWatch('request_type');

  return (
    <div style={{ display: request_type === 'slackwebhook' ? 'block' : 'none' }}>
      <Alert className='mb-4' type='info' showIcon message={t('slackwebhook_request_config.top_tip')} />
      <NativeNetworkSettings names={['request_config', 'slackwebhook_request_config']} proxyTip={t('slackwebhook_request_config.proxy_tip')} />
    </div>
  );
}
