import React from 'react';
import { Alert, Form } from 'antd';
import { useTranslation } from 'react-i18next';
import { NS } from '../../constants';
import NativeNetworkSettings from './NativeNetworkSettings';

export default function Teams() {
  const { t } = useTranslation(NS);
  const requestType = Form.useWatch('request_type');
  return (
    <div style={{ display: requestType === 'teams' ? 'block' : 'none' }}>
      <Alert className='mb-4' type='info' showIcon message={t('teams_request_config.top_tip')} />
      <NativeNetworkSettings names={['request_config', 'teams_request_config']} proxyTip={t('teams_request_config.proxy_tip')} />
    </div>
  );
}
