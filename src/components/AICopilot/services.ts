import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import type { AssistantChat, AssistantMessageDetail, AssistantAction, AssistantPageInfo } from './types';

export function createChat(data: { page: string; param?: any }): Promise<{ dat: AssistantChat }> {
  return request('/api/n9e/assistant/chat/new', {
    method: RequestMethod.Post,
    data,
  });
}

export function getChatHistory(): Promise<{ dat: AssistantChat[] }> {
  return request('/api/n9e/assistant/chat/history', {
    method: RequestMethod.Get,
  });
}

export function deleteChat(chatId: string) {
  return request(`/api/n9e/assistant/chat/${chatId}`, {
    method: RequestMethod.Delete,
  });
}

export function sendMessage(data: {
  chat_id: string;
  model_id?: number;
  query: {
    content: string;
    action?: AssistantAction;
    page_from?: AssistantPageInfo;
  };
}): Promise<{ dat: { chat_id: string; seq_id: number } }> {
  return request('/api/n9e/assistant/message/new', {
    method: RequestMethod.Post,
    data,
  });
}

export function getMessageDetail(data: { chat_id: string; seq_id: number }): Promise<{ dat: AssistantMessageDetail }> {
  return request('/api/n9e/assistant/message/detail', {
    method: RequestMethod.Post,
    data,
  });
}

export function getMessageHistory(data: { chat_id: string }): Promise<{ dat: AssistantMessageDetail[] }> {
  return request('/api/n9e/assistant/message/history', {
    method: RequestMethod.Post,
    data,
  });
}

export function cancelMessage(data: { chat_id: string; seq_id: number }) {
  return request('/api/n9e/assistant/message/cancel', {
    method: RequestMethod.Post,
    data,
  });
}
