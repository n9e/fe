import _ from 'lodash';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { ApiCreatChat, ApiSendMessage, EFeedbackStatus, IKnowledge, IMessageDetail } from '../store';

const apiPrefix = !!import.meta.env.VITE_IS_PRO ? '/api/n9e' : '/api/fc-model';

export interface IDataSourceList {
  p: number;
  limit: number;
  category: string;
  orderby?: string; // 排序 默认值created_at,可以按updated_at、status、name、plugin_type排序
  asc?: boolean; // 是否升序 true为升序
  plugin_type?: string;
  status?: string;
  query?: string;
  add_plugin_type?: string;
}

export const getDataSourceList = (data: IDataSourceList) => {
  return request(`/api/v1/datasource/list`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.data);
};

export const createChat = (data: ApiCreatChat) => {
  return request(`${apiPrefix}/assistant/chat/new`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res?.data);
};

export const getChatHistory = () => {
  return request(`${apiPrefix}/assistant/chat/history`, {
    method: RequestMethod.Get,
  }).then((res) => res?.data);
};

export const sendMessage = (data: ApiSendMessage) => {
  return request(`${apiPrefix}/assistant/message/new`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res?.data);
};

export const getMessageDetail = (data: { chat_id: string; seq_id: number }): Promise<IMessageDetail> => {
  return request(`${apiPrefix}/assistant/message/detail`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res?.data);
};

export const cancelMessage = (data: { chat_id: string; seq_id: number }) => {
  return request(`${apiPrefix}/assistant/message/cancel`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res?.data);
};

export const getMessageHistory = (data: { chat_id: string; seq_id?: number }) => {
  return request(`${apiPrefix}/assistant/message/history`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res?.data);
};

export const sendMessageFeedback = (data: { chat_id: string; seq_id: number; status: EFeedbackStatus }) => {
  return request(`${apiPrefix}/assistant/message/feedback`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res?.data);
};

export const addPrompt = (data: { prompt: string }) => {
  return request(`${apiPrefix}/assistant/prompt/add`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res?.data);
};

export const deletePrompt = (data: { prompt: string }) => {
  return request(`${apiPrefix}/assistant/prompt/del`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res?.data);
};

export const getPromptList = (): Promise<string[]> => {
  return request(`${apiPrefix}/assistant/prompt/get`, {
    method: RequestMethod.Get,
  }).then((res) => res?.data);
};

export const upsertKnowledge = (data) => {
  return request(`${apiPrefix}/knowledge/upsert`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res?.data);
};

export const getKnowledgeList = (): Promise<IKnowledge[]> => {
  return request(`${apiPrefix}/knowledge/list`, {
    method: RequestMethod.Get,
  }).then((res) => res?.data);
};

export const deleteKnowledge = (data: { id: number }) => {
  return request(`${apiPrefix}/knowledge/delete`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res?.data);
};

export const getFlashAiDatasource = () => {
  return request(`/api/v1/flashai/datasource/list`, {
    method: RequestMethod.Get,
  }).then((res) => res?.data);
};

/**
 * 测试环境用, 清理会话列表
 * @returns
 */
export const cleanChat = () => {
  return request(`${apiPrefix}/assistant/chat/clean`, {
    method: RequestMethod.Post,
  }).then((res) => res?.data);
};
