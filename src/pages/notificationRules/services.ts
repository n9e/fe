import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { RuleItem, NotifyStatistics } from './types';

export type { RuleItem, NotifyStatistics };

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

export function getPagerdutyServiceList(id: number) {
  return request(`/api/n9e/pagerduty-service-list/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
}

export function getPagedutyIntegrationKey(id: number, svc_id: string, integ_id: string) {
  // throw new Error('Deprecated function: getPagedutyIntegrationKey'); --- IGNORE ---
  return request(`/api/n9e/pagerduty-integration-key/${id}/${svc_id}/${integ_id}`, {
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

export function getNotifyStatistics(id: number, days: number): Promise<NotifyStatistics> {
  return request(`/api/n9e-plus/notify/${id}/statistics`, {
    method: RequestMethod.Get,
    params: { days },
  }).then((res) => {
    return res.dat;
  });
}

export function getNotifyEvents(
  id: number,
  params: {
    stime: number;
    etime: number;
    limit: number;
    p: number;
  },
) {
  return request(`/api/n9e-plus/notify/${id}/alert-cur-events`, {
    method: RequestMethod.Get,
    params,
  }).then((res) => {
    return res.dat;
  });
}

export function getNotifyAlertRules(id: number) {
  return request(`/api/n9e-plus/notify/${id}/alert-rules`, {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
}

export function getNotifySubAlertRules(id: number) {
  return request(`/api/n9e-plus/notify/${id}/sub-alert-rules`, {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
}

export function getEventTags() {
  return request('/api/n9e/event-tagkeys', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
}
