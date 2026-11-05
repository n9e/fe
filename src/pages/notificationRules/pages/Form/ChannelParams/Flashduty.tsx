import React, { useMemo } from 'react';
import { Form, Select } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import { useTranslation } from 'react-i18next';
import { useRequest } from 'ahooks';
import _ from 'lodash';

import { ChannelItem } from '@/pages/notificationChannels/types';

import { getFlashdutyChannelList } from '../../../services';
import type { FlashDutyChannel } from '../../../services';
import { NS, OPTIONS_CACHE_STALE_TIME } from '../../../constants';

interface Props {
  field: FormListFieldData;
  channelItem?: ChannelItem;
}

export default function Flashduty(props: Props) {
  return <FlashdutyInner key={props.channelItem?.id ?? 'no-channel'} {...props} />;
}

function FlashdutyInner(props: Props) {
  const { t } = useTranslation(NS);
  const { field, channelItem } = props;
  const channelId = channelItem?.id;
  const { data, error } = useRequest<FlashDutyChannel[], []>(
    () => {
      if (channelId == null) return Promise.resolve([]);
      return getFlashdutyChannelList(channelId);
    },
    {
      ready: channelId != null,
      cacheKey: channelId != null ? `notify-rule-flashduty-channels-${channelId}` : undefined,
      staleTime: OPTIONS_CACHE_STALE_TIME,
      onError: () => {},
    },
  );
  const channelOptions = useMemo(
    () =>
      _.map(error ? [] : data ?? [], (item) => {
        return {
          label: item.channel_name,
          value: item.channel_id,
        };
      }),
    [data, error],
  );

  return (
    <div>
      <Form.Item {...field} label={t('notification_configuration.flashduty.ids')} name={[field.name, 'params', 'ids']}>
        <Select options={channelOptions} showSearch optionFilterProp='label' mode='multiple' />
      </Form.Item>
    </div>
  );
}
