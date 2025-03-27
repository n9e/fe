import React, { useEffect, useState } from 'react';
import { Form, Select } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { ChannelItem } from '@/pages/notificationChannels/types';

import { getFlashdutyChannelList } from '../../../services';
import { NS } from '../../../constants';

interface Props {
  field: FormListFieldData;
  channelItem?: ChannelItem;
}

export default function Flashduty(props: Props) {
  const { t } = useTranslation(NS);
  const { field, channelItem } = props;
  const [channelOptions, setChannelOptions] = useState<any[]>();

  useEffect(() => {
    if (channelItem?.id) {
      getFlashdutyChannelList(channelItem?.id)
        .then((res) => {
          setChannelOptions(
            _.map(res, (item) => {
              return {
                label: item.channel_name,
                value: item.channel_id,
              };
            }),
          );
        })
        .catch(() => {
          setChannelOptions([]);
        });
    } else {
      setChannelOptions([]);
    }
  }, [channelItem?.id]);

  return (
    <div>
      <Form.Item {...field} label={t('notification_configuration.flashduty.ids')} name={[field.name, 'params', 'ids']}>
        <Select options={channelOptions} showSearch optionFilterProp='label' mode='multiple' />
      </Form.Item>
    </div>
  );
}
