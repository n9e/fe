import React from 'react';
import { useTranslation } from 'react-i18next';
import { Collapse, Form, Input } from 'antd';

import { NS } from '../../constants';

interface Props {
  ident: 'feishu' | 'feishucard' | 'lark' | 'larkcard';
}

export default function Feishu(props: Props) {
  const { t } = useTranslation(NS);
  const { ident } = props;
  const names = ['request_config', `${ident}_request_config`];
  let alert_shot_tip = t(`feishuapp_request_config.alert_shot_tip`);

  if (ident === 'lark' || ident === 'larkcard') {
    alert_shot_tip = t(`feishuapp_request_config.lark_alert_shot_tip`);
  }

  return (
    <Collapse ghost className='n9e-collapse-advanced-settings'>
      <Collapse.Panel key='advanced' header={t('advanced_settings')}>
        <Form.Item label={t('feishuapp_request_config.app_id')} tooltip={alert_shot_tip} name={[...names, 'app_id']}>
          <Input />
        </Form.Item>
        <Form.Item label={t('feishuapp_request_config.app_secret')} tooltip={alert_shot_tip} name={[...names, 'app_secret']}>
          <Input.Password />
        </Form.Item>
      </Collapse.Panel>
    </Collapse>
  );
}
