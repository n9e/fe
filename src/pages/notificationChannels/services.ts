import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { ChannelItem } from './types';

export type { ChannelItem };

export function getItems(): Promise<ChannelItem[]> {
  return request('/api/n9e/notify-channel-configs', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat ?? [];
  });
}

export function getSimplifiedItems(): Promise<ChannelItem[]> {
  return request('/api/n9e/simplified-notify-channel-configs', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat ?? [];
  });
}

export function postItems(data: ChannelItem[]) {
  return request('/api/n9e/notify-channel-configs', {
    method: RequestMethod.Post,
    data,
  });
}

export function putItem(data: ChannelItem) {
  return request(`/api/n9e/notify-channel-config/${data.id}`, {
    method: RequestMethod.Put,
    data,
  });
}

export function getItem(id: number) {
  return request(`/api/n9e/notify-channel-config/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
}

export function getItemByIdent(ident: string) {
  return request('/api/n9e/notify-channel-config', {
    method: RequestMethod.Get,
    params: {
      ident,
    },
  }).then((res) => {
    return res.dat;
  });
}

export function deleteItems(ids: number[]) {
  return request('/api/n9e/notify-channel-configs', {
    method: RequestMethod.Delete,
    data: {
      ids,
    },
  });
}
