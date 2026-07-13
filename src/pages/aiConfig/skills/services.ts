import _ from 'lodash';

import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

import { Item, FormValues, FileItem, SkillDetail, FileContent, GitInstallPayload, SkillAuthValues } from './types';

export type { Item, FormValues, FileItem, SkillDetail, FileContent, GitInstallPayload, SkillAuthValues };

// appendSkillAuth 把授权范围+团队塞进 multipart 表单（后端按 JSON 数组 / int 解析）。
function appendSkillAuth(formData: FormData, auth?: SkillAuthValues) {
  if (!auth) {
    return;
  }
  formData.append('user_group_ids', JSON.stringify(auth.user_group_ids ?? []));
  formData.append('private', String(auth.private ?? 0));
}

export const getList = function (): Promise<Item[]> {
  return request('/api/n9e/ai-skills', {
    method: RequestMethod.Get,
  }).then((res) => res.dat ?? []);
};

export const getItem = function (id: number): Promise<SkillDetail> {
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

export const importItem = function (file: File, auth?: SkillAuthValues) {
  const formData = new FormData();
  formData.append('file', file);
  appendSkillAuth(formData, auth);
  return request('/api/n9e/ai-skills/import', {
    method: RequestMethod.Post,
    data: formData,
  }).then((res) => res.dat);
};

export const importItemToUpdate = function (id: number, file: File, auth?: SkillAuthValues) {
  const formData = new FormData();
  formData.append('file', file);
  appendSkillAuth(formData, auth);
  return request(`/api/n9e/ai-skill/${id}/import`, {
    method: RequestMethod.Put,
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

export const getFile = function (fileId: number): Promise<FileContent> {
  return request(`/api/n9e/ai-skill-file/${fileId}`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};

export const deleteFile = function (fileId: number) {
  return request(`/api/n9e/ai-skill-file/${fileId}`, {
    method: RequestMethod.Delete,
  }).then((res) => res.dat);
};

interface GitRequestOptions {
  silence?: boolean;
  signal?: AbortSignal;
}

export const gitInstall = function (data: GitInstallPayload, options?: GitRequestOptions) {
  return request('/api/n9e/ai-skills/git/install', {
    method: RequestMethod.Post,
    data,
    silence: options?.silence,
    signal: options?.signal,
  }).then((res) => res.dat);
};

export const gitReplaceConfig = function (id: number, data: Partial<GitInstallPayload>, options?: GitRequestOptions) {
  return request(`/api/n9e/ai-skill/${id}/git/install`, {
    method: RequestMethod.Put,
    data,
    silence: options?.silence,
    signal: options?.signal,
  }).then((res) => res.dat);
};

export const gitUpdate = function (id: number, data: Partial<GitInstallPayload>, options?: GitRequestOptions) {
  return request(`/api/n9e/ai-skill/${id}/git/update`, {
    method: RequestMethod.Post,
    data,
    silence: options?.silence,
    signal: options?.signal,
  }).then((res) => res.dat);
};
