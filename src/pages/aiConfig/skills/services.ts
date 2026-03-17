import _ from 'lodash';

import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

import { Item, FormValues, FileItem } from './types';

export type { Item, FormValues, FileItem };

export const getList = function (): Promise<Item[]> {
  return request('/api/n9e/ai-skills', {
    method: RequestMethod.Get,
  }).then((res) => res.dat ?? []);
};

export const getItem = function (id: number): Promise<Item & { files: FileItem[] }> {
  return request(`/api/n9e/ai-skill/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};

export const postItem = function (data: FormValues) {
  return request('/api/n9e/ai-skills', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const importItem = function (file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request('/api/n9e/ai-skills/import', {
    method: RequestMethod.Post,
    data: formData,
  }).then((res) => res.dat);
};

export const putItem = function (id: number, data: FormValues) {
  return request(`/api/n9e/ai-skill/${id}`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => res.dat);
};

export const deleteItem = function (id: number) {
  return request(`/api/n9e/ai-skill/${id}`, {
    method: RequestMethod.Delete,
  }).then((res) => res.dat);
};

export const getFiles = function (id: number): Promise<FileItem[]> {
  return request(`/api/n9e/ai-skill/${id}/files`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat ?? []);
};

export const getFile = function (fileId: number): Promise<
  FileItem & {
    content: string;
  }
> {
  return request(`/api/n9e/ai-skill-file/${fileId}`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};

export const deleteFile = function (fileId: number) {
  return request(`/api/n9e/ai-skill-file/${fileId}`, {
    method: RequestMethod.Delete,
  }).then((res) => res.dat);
};

export const uploadFile = function (id: number, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return request(`/api/n9e/ai-skill/${id}/files`, {
    method: RequestMethod.Post,
    data: formData,
  }).then((res) => res.dat);
};
