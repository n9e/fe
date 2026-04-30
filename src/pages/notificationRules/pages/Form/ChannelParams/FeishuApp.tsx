import React, { useEffect, useState } from 'react';
import { Form, Select } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

import { ChannelItem } from '@/pages/notificationChannels/types';

import { getFeishuGroups } from '../../../services';
import { NS } from '../../../constants';

interface Props {
  field: FormListFieldData;
  channelItem?: ChannelItem;
}

export default function FeishuApp(props: Props) {
  const { t } = useTranslation(NS);
  const { field, channelItem } = props;
  const [groupOptions, setGroupOptions] = useState<any[]>();

  useEffect(() => {
    if (channelItem?.id) {
      getFeishuGroups(channelItem?.id)
        .then((res) => {
          setGroupOptions(
            _.map(res, (item) => {
              return {
                label: item.name,
                value: item.chat_id,
              };
            }),
          );
        })
        .catch(() => {
          setGroupOptions([]);
        });
    } else {
      setGroupOptions([]);
    }
  }, [channelItem?.id]);

  return (
    <div>
      <Form.Item {...field} label={t('notification_configuration.feishuapp.feishu_groups')} name={[field.name, 'params', 'feishu_groups']}>
        <Select options={groupOptions} showSearch optionFilterProp='label' mode='multiple' />
      </Form.Item>
    </div>
  );
}
