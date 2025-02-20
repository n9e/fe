import React, { useEffect, useState } from 'react';
import { Form, Select } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

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

  useEffect(() => {
    if (channel_id) {
      getNotificationTemplates(channel_id).then((res) => {
        setOptions(
          _.map(res, (item) => {
            return {
              label: item.name,
              value: item.id,
            };
          }),
        );
      });
    }
  }, [channel_id]);

  return (
    <Form.Item {...field} label={t('notification_configuration.template')} name={[field.name, 'template_id']} rules={[{ required: true }]}>
      <Select options={options} showSearch optionFilterProp='label' />
    </Form.Item>
  );
}
