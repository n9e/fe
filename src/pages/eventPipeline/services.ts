import _ from 'lodash';

import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

import { Item } from './types';

export type { Item };

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
  return request('/api/n9e/event-pipeline', {
    method: RequestMethod.Delete,
    data: { ids },
  }).then((res) => res.dat);
};

export const eventProcessorTryrun = function (data: { event_id: number; processor_config: Item['processors'][0] }) {
  return request('/api/n9e/event-processor-tryrun', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const eventPipelineTryrun = function (data: { event_id: number; pipeline_config: Item }) {
  return request('/api/n9e/event-pipeline-tryrun', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};
