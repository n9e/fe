import React from 'react';
import { Col, Form, Input, Row, Space, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';

import { ChannelItem } from '@/pages/notificationChannels/types';

import { NS } from '../../../constants';
import CredentialInput, { maskSecret } from './CredentialInput';

interface Props {
  prefixNamePath?: (string | number)[];
  field: FormListFieldData;
  channelItem?: ChannelItem;
}

/**
 * JSM 告警的规则侧参数：API 集成的 key（决定告警归哪个团队）+ 名称。级别与优先级映射是组织级约定，在媒介里配。
 * 与 Discord 的 Webhook 地址一样填在规则里，同一个媒介可以发给任意多个团队。
 */
export default function JSMAlert(props: Props) {
  const { t } = useTranslation(NS);
  const { field, channelItem, prefixNamePath = [] } = props;
  const paramsPath = [...prefixNamePath, field.name, 'params'];

  const label = (key: string) => (
    <Space size={4}>
      {t(`notification_configuration.jsm_alert.${key}`)}
      <Tooltip className='n9e-ant-from-item-tooltip' overlayClassName='ant-tooltip-max-width-600' title={t(`notification_configuration.jsm_alert.${key}_tip`)}>
        <QuestionCircleOutlined />
      </Tooltip>
    </Space>
  );

  return (
    <div>
      <Row gutter={16}>
        <Col span={16}>
          <Form.Item
            {...field}
            label={label('api_key')}
            messageVariables={{ label: t('notification_configuration.jsm_alert.api_key') }}
            name={[field.name, 'params', 'api_key']}
            rules={[{ required: true }]}
          >
            <CredentialInput
              channelId={channelItem?.id}
              paramsPath={paramsPath}
              credentialKey='api_key'
              mask={maskSecret}
              placeholder='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
              historyPlaceholder={t('notification_configuration.jsm_alert.api_key_history_placeholder')}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item {...field} label={label('bot_name')} name={[field.name, 'params', 'bot_name']}>
            <Input placeholder='SRE team' />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
}
