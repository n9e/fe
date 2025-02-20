import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { RuleItem } from './types';

export type { RuleItem };

export function getItems(): Promise<RuleItem[]> {
  return request('/api/n9e/notify-rules', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat ?? [];
  });
}

export function getItem(id: number) {
  return request(`/api/n9e/notify-rule/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
}

export function postItems(data: RuleItem[]) {
  return request('/api/n9e/notify-rules', {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat;
  });
}

export function putItem(data: RuleItem) {
  return request(`/api/n9e/notify-rule/${data.id}`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => {
    return res.dat;
  });
}

export function deleteItems(ids: number[]) {
  return request('/api/n9e/notify-rules', {
    method: RequestMethod.Delete,
    data: { ids },
  }).then((res) => {
    return res.dat;
  });
}
