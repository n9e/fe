import React from 'react';
import { useTranslation } from 'react-i18next';
import { Collapse, Form, Input } from 'antd';

import { NS } from '../../constants';

export default function Dingtalk() {
  const { t } = useTranslation(NS);
  const names = ['request_config', 'dingtalk_request_config'];

  return (
    <Collapse ghost className='n9e-collapse-advanced-settings'>
      <Collapse.Panel key='advanced' header={t('advanced_settings')}>
        <Form.Item label={t('dingtalkapp_request_config.app_key')} tooltip={t('dingtalkapp_request_config.alert_shot_tip')} name={[...names, 'app_key']}>
          <Input />
        </Form.Item>
        <Form.Item label={t('dingtalkapp_request_config.app_secret')} tooltip={t('dingtalkapp_request_config.alert_shot_tip')} name={[...names, 'app_secret']}>
          <Input.Password />
        </Form.Item>
      </Collapse.Panel>
    </Collapse>
  );
}
