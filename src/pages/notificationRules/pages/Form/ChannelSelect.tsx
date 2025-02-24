import React, { useEffect, useState } from 'react';
import { Form, Select, Space } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Link } from 'react-router-dom';

import { getItems as getNotificationChannels } from '@/pages/notificationChannels/services';

import { NS } from '../../constants';

interface Props {
  field: FormListFieldData;
}

export default function ChannelSelect(props: Props) {
  const { t } = useTranslation(NS);
  const { field } = props;
  const [options, setOptions] = useState<{ label: string; value: number }[]>([]);
  const fetchData = () => {
    getNotificationChannels()
      .then((res) => {
        setOptions(
          _.map(res, (item) => {
            return {
              label: item.name,
              value: item.id,
            };
          }),
        );
      })
      .catch(() => {
        setOptions([]);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Form.Item
      {...field}
      label={
        <Space>
          {t('notification_configuration.channel')}
          <Link
            to='/notification-channels'
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            {t('common:manage')}
          </Link>
          <a
            onClick={(e) => {
              e.preventDefault();
              fetchData();
            }}
          >
            {t('common:reload')}
          </a>
        </Space>
      }
      name={[field.name, 'channel_id']}
      rules={[{ required: true }]}
    >
      <Select options={options} showSearch optionFilterProp='label' />
    </Form.Item>
  );
}
