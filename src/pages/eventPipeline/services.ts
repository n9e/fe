import _ from 'lodash';

import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

import { Item, ExecutionItem } from './types';

export type { Item, ExecutionItem };

export const getList = function (): Promise<Item[]> {
  return request('/api/n9e/event-pipelines', {
    method: RequestMethod.Get,
  }).then((res) => res.dat ?? []);
};

export const getItem = function (id: number): Promise<Item> {
  return request(`/api/n9e/event-pipeline/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};

export const postItem = function (data: Item) {
  return request('/api/n9e/event-pipeline', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const putItem = function (data: Item) {
  return request('/api/n9e/event-pipeline', {
    method: RequestMethod.Put,
    data,
  }).then((res) => res.dat);
};

export const deleteItems = function (ids: number[]) {
  return request('/api/n9e/event-pipelines', {
    method: RequestMethod.Delete,
    data: { ids },
  }).then((res) => res.dat);
};

export const eventProcessorTryrun = function (data: { event_id: number; processor_config: Item['processors'][0] }) {
  return request('/api/n9e/event-processor-tryrun', {
    method: RequestMethod.Post,
    data,
  });
};

export const eventPipelineTryrun = function (data: { event_id: number; pipeline_config: Item }) {
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

export const getExecutionById = function (id: number): Promise<ExecutionItem> {
  return request(`/api/n9e/event-pipeline-execution/${id}`, {
    method: RequestMethod.Get,
    params: { exec_id: id },
  }).then((res) => res.dat);
};
