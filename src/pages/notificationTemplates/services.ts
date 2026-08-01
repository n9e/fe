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

/** 单个模板字段的预览结果，success 为 false 时 message 是 Go 模板的编译/执行报错 */
export interface PreviewFieldResult {
  content: string;
  success: boolean;
  message: string;
}

/**
 * 预览事件来源：历史事件需要环境里真有告警，模拟事件用于全新环境。
 * 与工作流试跑 / 通知规则测试同一套语义。
 */
export type PreviewEventSource =
  | { event_ids: number[]; use_mock_event?: false }
  | { use_mock_event: true; mock_severity?: number; mock_is_recovered?: boolean };

export function preview(
  data: PreviewEventSource & {
    tpl: {
      content: {
        [index: string]: string;
      };
    };
  },
): Promise<{ [index: string]: PreviewFieldResult }> {
  return request('/api/n9e/events-message', {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat ?? {};
  });
}
