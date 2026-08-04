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

/** 测试结果刻意只有成败与原因：后端不回显任何配置字段与收件人联系方式 */
export interface ChannelTestResult {
  success: boolean;
  error_message: string;
}

/** 测试事件来源，与工作流试跑 / 通知规则测试同一套语义 */
export type ChannelTestEventSource =
  | { event_ids: number[]; use_mock_event?: false }
  | { use_mock_event: true; mock_severity?: number; mock_is_recovered?: boolean };

/**
 * 测试一份「可能尚未保存」的媒介配置。
 * config 走接口态（需先过 normalizeFormValues），tpl_content 是模板源码、由后端渲染。
 */
export function testItem(
  data: ChannelTestEventSource & {
    config: ChannelItem;
    notify_config?: { params?: Record<string, any>; severities?: number[] };
    tpl_content?: Record<string, string>;
  },
): Promise<ChannelTestResult> {
  return request('/api/n9e/notify-channel-config/test', {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat;
  });
}

export function getItemsIdents(): Promise<string[]> {
  return request('/api/n9e/notify-channel-config/idents', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat ?? [];
  });
}
