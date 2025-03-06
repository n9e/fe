import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { Item } from './types';

export type { Item };

export function getItems(notify_channel_ids?: string): Promise<Item[]> {
  return request('/api/n9e/message-templates', {
    method: RequestMethod.Get,
    params: {
      notify_channel_ids,
    },
  }).then((res) => {
    return res.dat ?? [];
  });
}

export function getItem(id: number): Promise<Item> {
  return request(`/api/n9e/message-template/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat ?? {};
  });
}

export function postItems(data: Item[]) {
  return request('/api/n9e/message-templates', {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat;
  });
}

export function putItem(data: Item) {
  return request(`/api/n9e/message-template/${data.id}`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => {
    return res.dat;
  });
}

export function deleteItem(ids: number[]) {
  return request('/api/n9e/message-templates', {
    method: RequestMethod.Delete,
    data: { ids },
  }).then((res) => {
    return res.dat;
  });
}

export function preview(data: {
  event_ids: number[];
  tpl: {
    content: {
      [index: string]: string;
    };
  };
}) {
  return request('/api/n9e/events-message', {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat;
  });
}
