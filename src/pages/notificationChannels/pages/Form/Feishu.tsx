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
  // 后端 RequestConfig 只有 feishu_request_config 这一个字段（feishucard/larkcard 的截图上传也读它），
  // 按 ident 拼出来的 feishucard_/lark_/larkcard_request_config 后端不认识，提交上去会被直接丢掉。
  const names = ['request_config', 'feishu_request_config'];
  let alert_shot_tip = t(`feishuapp_request_config.alert_shot_tip`);

  if (ident === 'lark' || ident === 'larkcard') {
    alert_shot_tip = t(`feishuapp_request_config.lark_alert_shot_tip`);
  }

  return (
    <Collapse ghost className='n9e-collapse-advanced-settings'>
      <Collapse.Panel key='advanced' header={t('advanced_settings')} forceRender>
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
