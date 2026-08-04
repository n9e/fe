import _ from 'lodash';

import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

import { Item, ExecutionItem } from './types';

export type { Item, ExecutionItem };

type SaveWorkflowPayload = {
  group_id: number;
  use_case: string;
  name: string;
  processors: Item['processors'];
};

export const getList = function (params?: { group_id: number; use_case: string }): Promise<Item[]> {
  return request('/api/n9e/event-pipelines', {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat ?? []);
};

export const getItem = function (id: number): Promise<Item> {
  return request(`/api/n9e/event-pipeline/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};

export const postItem = function (data: Item | SaveWorkflowPayload) {
  return request('/api/n9e/event-pipeline', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const putItem = function (data: Item | (SaveWorkflowPayload & { id: number })) {
  return request('/api/n9e/event-pipeline', {
    method: RequestMethod.Put,
    data,
  }).then((res) => res.dat);
};

/**
 * 批量启用 / 停用。
 * 必须用这个窄接口，不能拿 PUT /event-pipeline 整条回写：那是 Select("*") 全字段覆盖，
 * 调用方持有的往往是列表加载时的旧快照，回写会把期间别人改过的 processors / 过滤条件
 * 一起写回去，静默回退对方的改动，并立刻改变线上事件处理行为。
 */
export const putItemsDisabled = function (ids: number[], disabled: boolean) {
  return request('/api/n9e/event-pipelines/disabled', {
    method: RequestMethod.Put,
    data: { ids, disabled },
  }).then((res) => res.dat);
};

export const deleteItems = function (ids: number[]) {
  return request('/api/n9e/event-pipelines', {
    method: RequestMethod.Delete,
    data: { ids },
  }).then((res) => res.dat);
};

/**
 * 试跑事件来源：要么挑一条历史事件，要么让后端合成一条样例事件。
 * 样例事件用于新环境（没有任何历史告警时也能验证处理器配置），与通知规则测试的
 * use_mock_event 同一套语义；mock_severity / mock_is_recovered 用来覆盖那些
 * 按级别、按恢复态分支的处理器（如事件丢弃）。
 */
export type TryrunEventSource =
  | { event_id: number; use_mock_event?: false }
  | { use_mock_event: true; mock_severity?: number; mock_is_recovered?: boolean };

export const eventProcessorTryrun = function (data: TryrunEventSource & { processor_config: Item['processors'][0] }) {
  return request('/api/n9e/event-processor-tryrun', {
    method: RequestMethod.Post,
    data,
  });
};

export const eventPipelineTryrun = function (data: TryrunEventSource & { pipeline_config: Item }) {
  return request('/api/n9e/event-pipeline-tryrun', {
    method: RequestMethod.Post,
    data,
  });
};

export function getEventTagKeys() {
  return request('/api/n9e/event-tagkeys', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
}

export function getEventTagValues(key: string) {
  return request('/api/n9e/event-tagvalues', {
    method: RequestMethod.Get,
    params: { key },
  }).then((res) => {
    return res.dat;
  });
}

export function getEventEnrichDataPreview(data: { cate: string; config: Record<string, any>; event_id: number }) {
  return request('/api/n9e-plus/event-enrich-data-preview', {
    method: RequestMethod.Post,
    data,
    silence: true,
  }).then((res) => {
    return res.dat;
  });
}

export const getExecutions = function (params): Promise<{
  list: ExecutionItem[];
  total: number;
}> {
  return request('/api/n9e/event-pipeline-executions', {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat);
};

export const getExecutionById = function (id: string): Promise<ExecutionItem> {
  return request(`/api/n9e/event-pipeline-execution/${id}`, {
    method: RequestMethod.Get,
    params: { exec_id: id },
  }).then((res) => res.dat);
};
