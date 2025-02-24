import React, { useState, useEffect } from 'react';
import { Form, Select, Space } from 'antd';
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
          <Link
            to='/notification-rule'
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
      rules={[{ required: true }]}
    >
      <Select options={options} showSearch optionFilterProp='label' mode='multiple' />
    </Form.Item>
  );
}
