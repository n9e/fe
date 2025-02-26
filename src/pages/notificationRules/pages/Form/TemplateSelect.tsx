import React, { useEffect, useState } from 'react';
import { Form, Select, Space } from 'antd';
import { SettingOutlined, SyncOutlined } from '@ant-design/icons';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { Link } from 'react-router-dom';

import { getItems as getNotificationTemplates } from '@/pages/notificationTemplates/services';

import { NS } from '../../constants';

interface Props {
  field: FormListFieldData;
}

export default function TemplateSelect(props: Props) {
  const { t } = useTranslation(NS);
  const { field } = props;
  const [options, setOptions] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const channel_id = Form.useWatch(['notify_configs', field.name, 'channel_id']);
  const fetchData = (channel_id) => {
    if (channel_id) {
      setLoading(true);
      getNotificationTemplates(channel_id)
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
    } else {
      setOptions([]);
    }
  };

  useEffect(() => {
    fetchData(channel_id);
  }, [channel_id]);

  return (
    <Form.Item
      {...field}
      label={
        <Space>
          {t('notification_configuration.template')}
          <Link to='/notification-templates' target='_blank'>
            <SettingOutlined />
          </Link>
          <SyncOutlined
            spin={loading}
            onClick={(e) => {
              fetchData(channel_id);
              e.preventDefault();
            }}
          />
        </Space>
      }
      name={[field.name, 'template_id']}
      rules={[{ required: true }]}
    >
      <Select options={options} showSearch optionFilterProp='label' />
    </Form.Item>
  );
}
