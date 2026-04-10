import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import {
  IAiChatCreateChatRequest,
  IAiChatHistoryItem,
  IAiChatMessage,
  IAiChatMessageHistoryRequest,
  IAiChatMessageLocator,
  IAiChatSendMessageRequest,
  IAiChatSendMessageResponse,
} from './types';

const apiPrefix = '/api/n9e/assistant';

export const createChat = (data: IAiChatCreateChatRequest): Promise<IAiChatHistoryItem> => {
  return request(`${apiPrefix}/chat/new`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res?.dat);
};

export const getChatHistory = (): Promise<IAiChatHistoryItem[]> => {
  return request(`${apiPrefix}/chat/history`, {
    method: RequestMethod.Get,
  }).then((res) => res?.dat || []);
};

export const deleteChat = (chatId: string): Promise<void> => {
  return request(`${apiPrefix}/chat/${chatId}`, {
    method: RequestMethod.Delete,
  }).then(() => undefined);
};

export const sendMessage = (data: IAiChatSendMessageRequest): Promise<IAiChatSendMessageResponse> => {
  return request(`${apiPrefix}/message/new`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res?.dat);
};

export const getMessageDetail = (data: IAiChatMessageLocator): Promise<IAiChatMessage> => {
  return request(`${apiPrefix}/message/detail`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res?.dat);
};

export const getMessageHistory = (data: IAiChatMessageHistoryRequest): Promise<IAiChatMessage[]> => {
  return request(`${apiPrefix}/message/history`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res?.dat || []);
};

export const cancelMessage = (data: IAiChatMessageLocator): Promise<void> => {
  return request(`${apiPrefix}/message/cancel`, {
    method: RequestMethod.Post,
    data,
  }).then(() => undefined);
};
