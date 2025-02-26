import React, { useEffect, useState } from 'react';
import { Form } from 'antd';
import { FormListFieldData } from 'antd/lib/form/FormList';
import _ from 'lodash';

import { ChannelItem } from '@/pages/notificationChannels/types';
import { getItem as getChannel } from '@/pages/notificationChannels/services';

import UserInfo from './UserInfo';
import Flashduty from './Flashduty';
import Custom from './Custom';

interface Props {
  field: FormListFieldData;
}

export default function index(props: Props) {
  const { field } = props;
  const channel_id = Form.useWatch(['notify_configs', field.name, 'channel_id']);
  const [channelDetail, setChannelDetail] = useState<ChannelItem>();
  const request_type = channelDetail?.request_type;
  const customParams = channelDetail?.param_config?.custom?.params ?? [];

  useEffect(() => {
    if (channel_id) {
      getChannel(channel_id).then((res) => {
        setChannelDetail(res);
      });
    }
  }, [channel_id]);

  if (request_type === 'flashduty') {
    return <Flashduty field={field} />;
  }

  if (_.includes(['http', 'script'], request_type)) {
    return (
      <>
        <UserInfo field={field} />
        <Custom field={field} customParams={customParams} />
      </>
    );
  }

  return null;
}
