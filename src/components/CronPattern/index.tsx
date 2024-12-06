import React from 'react';
import { Form, AutoComplete } from 'antd';
import { useTranslation } from 'react-i18next';
import './locale';

interface Props {
  name: string | (string | number)[];
  label?: string;
}

export default function CronPattern(props: Props) {
  const { name, label } = props;
  const { t } = useTranslation('CronPattern');
  return (
    <Form.Item
      name={name}
      label={label || t('cron_pattern')}
      rules={[{ required: true, message: t('cron_pattern_msg') }]}
      initialValue='@every 15s'
      tooltip={t('cron_pattern_tip')}
    >
      <AutoComplete
        options={[
          { label: '@every 15s', value: '@every 15s' },
          { label: '@every 30s', value: '@every 30s' },
          { label: '@every 45s', value: '@every 45s' },
          { label: '@every 60s', value: '@every 60s' },
          { label: '@every 120s', value: '@every 120s' },
          { label: '@every 150s', value: '@every 150s' },
          { label: '@every 180s', value: '@every 180s' },
          { label: '@every 300s', value: '@every 300s' },
        ]}
      />
    </Form.Item>
  );
}
