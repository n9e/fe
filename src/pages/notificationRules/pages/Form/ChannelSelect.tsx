import React, { useEffect, useState } from 'react';
import { Form, Select, Space, Tag, Tooltip } from 'antd';
import { QuestionCircleOutlined, SettingOutlined, SyncOutlined } from '@ant-design/icons';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Link } from 'react-router-dom';

import { getSimplifiedItems as getNotificationChannels, ChannelItem } from '@/pages/notificationChannels/services';
import { useIsAuthorized } from '@/components/AuthorizationWrapper';
import { PERM } from '@/pages/notificationChannels/constants';

import { NS } from '../../constants';

interface Props {
  field: FormListFieldData;
  onChange?: (value: any, item?: ChannelItem) => void;
}

export default function ChannelSelect(props: Props) {
  const { t } = useTranslation(NS);
  const { field, onChange } = props;
  const [options, setOptions] = useState<{ label: string; value: number; enable: Boolean; item: ChannelItem }[]>([]);
  const [loading, setLoading] = useState(false);
  const form = Form.useFormInstance();
  const channel_id = Form.useWatch(['notify_configs', field.name, 'channel_id']);
  const isAuthorized = useIsAuthorized([PERM]);
  const fetchData = () => {
    setLoading(true);
    getNotificationChannels()
      .then((res) => {
        setOptions(
          _.map(res, (item) => {
            return {
              label: item.name,
              value: item.id,
              enable: item.enable,
              item,
            };
          }),
        );
      })
      .catch(() => {
        setOptions([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    const item = _.find(options, { value: channel_id })?.item;
    onChange && onChange(channel_id, item);
  }, [channel_id, JSON.stringify(options)]);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Form.Item
      {...field}
      label={
        <Space size={4}>
          {t('notification_configuration.channel')}
          <Tooltip className='n9e-ant-from-item-tooltip' title={t('notification_configuration.channel_tip')}>
            <QuestionCircleOutlined />
          </Tooltip>
          {isAuthorized && (
            <Link to='/notification-channels' target='_blank'>
              <SettingOutlined />
            </Link>
          )}
          <SyncOutlined
            spin={loading}
            onClick={(e) => {
              fetchData();
              e.preventDefault();
            }}
          />
        </Space>
      }
      name={[field.name, 'channel_id']}
      rules={[{ required: true, message: t('notification_configuration.channel_msg') }]}
    >
      <Select
        options={_.map(options, (item) => {
          return {
            label: (
              <Space>
                {item.label}
                {!item.enable && <Tag color='warning'>{t('common:disabled')}</Tag>}
                {isAuthorized && (
                  <Link to={`/notification-channels/edit/${item.value}`} target='_blank'>
                    {t('common:btn.view')}
                  </Link>
                )}
              </Space>
            ),
            optionLabel: (
              <Space>
                {item.label}
                {!item.enable && <Tag color='warning'>{t('common:disabled')}</Tag>}
              </Space>
            ),
            originLabel: item.label,
            value: item.value,
          };
        })}
        showSearch
        optionLabelProp='optionLabel'
        optionFilterProp='originLabel'
        onChange={() => {
          // 修改 channel_id 时，清空 template_id
          form.setFieldsValue({
            notify_configs: _.map(form.getFieldValue('notify_configs'), (item, index: number) => {
              if (index === field.name) {
                return _.omit(item, ['template_id', 'params']);
              }
              return item;
            }),
          });
        }}
      />
    </Form.Item>
  );
}
