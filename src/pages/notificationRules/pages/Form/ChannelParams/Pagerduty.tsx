import React, { useEffect, useState } from 'react';
import { Form, Select } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { ChannelItem } from '@/pages/notificationChannels/types';

import { getPagerdutyServiceList } from '../../../services';
import { NS } from '../../../constants';

interface Props {
  field: FormListFieldData;
  channelItem?: ChannelItem;
}

export default function PagerDuty(props: Props) {
  const { t } = useTranslation(NS);
  const { field, channelItem } = props;
  const [channelOptions, setChannelOptions] = useState<any[]>();

  useEffect(() => {
    if (channelItem?.id) {
      getPagerdutyServiceList(channelItem?.id)
        .then((res) => {
          setChannelOptions(
            _.map(res, (item) => {
              return {
                label: `${item.service_name}/${item.integration_summary}`,
                value: item.integration_url,  //  实际值
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
      <Form.Item {...field} label={t('notification_configuration.pagerduty.services')} name={[field.name, 'params', 'pagerduty_integration_keys']}>
        <Select options={channelOptions} showSearch optionFilterProp='label' mode='multiple' />
      </Form.Item>
    </div>
  );
}
