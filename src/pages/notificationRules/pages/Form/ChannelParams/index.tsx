import React from 'react';
import { FormListFieldData } from 'antd/lib/form/FormList';
import _ from 'lodash';

import { ChannelItem } from '@/pages/notificationChannels/types';

import UserInfo from './UserInfo';
import Flashduty from './Flashduty';
import Custom from './Custom';

interface Props {
  field: FormListFieldData;
  channelItem?: ChannelItem;
}

export default function index(props: Props) {
  const { field, channelItem } = props;
  const request_type = channelItem?.request_type;
  const contactKey = channelItem?.param_config?.user_info?.contact_key;
  const customParams = channelItem?.param_config?.custom?.params ?? [];

  if (request_type === 'flashduty') {
    return <Flashduty field={field} channelItem={channelItem} />;
  }

  return (
    <>
      {contactKey && <UserInfo field={field} />}
      <Custom field={field} customParams={customParams} />
    </>
  );
}
