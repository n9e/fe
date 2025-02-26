import React, { useState, useEffect } from 'react';
import { Form, Select, Space } from 'antd';
import { SettingOutlined, SyncOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import _ from 'lodash';

import { getItems as getNotificationRules } from '@/pages/notificationRules/services';

interface Props {
  label?: React.ReactNode;
}

export default function NotificationRuleSelect(props: Props) {
  const { t } = useTranslation('alertRules');
  const { label = t('notify_rule_ids') } = props;
  const [options, setOptions] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchData = () => {
    getNotificationRules()
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
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Form.Item
      name='notify_rule_ids'
      label={
        <Space>
          {label}
          <Link to='/notification-rules' target='_blank'>
            <SettingOutlined />
          </Link>
          <SyncOutlined
            spin={loading}
            onClick={(e) => {
              fetchData();
              e.preventDefault();
            }}
          />
        </Space>
      }
    >
      <Select options={options} showSearch optionFilterProp='label' mode='multiple' />
    </Form.Item>
  );
}
