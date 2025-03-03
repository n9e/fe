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

export function getFlashdutyChannelList(id: number) {
  return request(`/api/n9e/flashduty-channel-list/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
}

export function notifyRuleTest(data: { event_ids: number[]; notify_config: any }) {
  return request('/api/n9e/notify-rule/test', {
    method: RequestMethod.Post,
    data,
  });
}

export function getCustomParamsValues(notify_channel_id: number) {
  return request('/api/n9e/notify-rule/custom-params', {
    method: RequestMethod.Get,
    params: { notify_channel_id },
  }).then((res) => {
    return res.dat ?? [];
  });
}
