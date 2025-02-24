import React, { useEffect, useState } from 'react';
import { Form, Select, Space } from 'antd';
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
  const channel_id = Form.useWatch(['notify_configs', field.name, 'channel_id']);
  const fetchData = (channel_id) => {
    if (channel_id) {
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
        <Space
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          {t('notification_configuration.template')}
          <Link to='/notification-templates' target='_blank'>
            {t('common:manage')}
          </Link>
          <a
            onClick={(e) => {
              fetchData(channel_id);
            }}
          >
            {t('common:reload')}
          </a>
        </Space>
      }
      name={[field.name, 'template_id']}
      rules={[{ required: true }]}
    >
      <Select options={options} showSearch optionFilterProp='label' />
    </Form.Item>
  );
}
