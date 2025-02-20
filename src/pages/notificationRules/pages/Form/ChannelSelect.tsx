import React, { useEffect, useState } from 'react';
import { Form, Select } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { getItems as getNotificationChannels } from '@/pages/notificationChannels/services';

import { NS } from '../../constants';

interface Props {
  field: FormListFieldData;
}

export default function ChannelSelect(props: Props) {
  const { t } = useTranslation(NS);
  const { field } = props;
  const [options, setOptions] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    getNotificationChannels().then((res) => {
      setOptions(
        _.map(res, (item) => {
          return {
            label: item.name,
            value: item.id,
          };
        }),
      );
    });
  }, []);

  return (
    <Form.Item {...field} label={t('notification_configuration.channel')} name={[field.name, 'channel_id']} rules={[{ required: true }]}>
      <Select options={options} showSearch optionFilterProp='label' />
    </Form.Item>
  );
}
