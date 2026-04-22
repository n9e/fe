import { IS_ENT } from '@/utils/constant';
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

const apiPrefix = IS_ENT ? '/api/fc-model/assistant' : '/api/n9e/assistant';
const dataPathName = IS_ENT ? 'data' : 'dat';

export const createChat = (data: IAiChatCreateChatRequest): Promise<IAiChatHistoryItem> => {
  return request(`${apiPrefix}/chat/new`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res?.[dataPathName]);
};

export const getChatHistory = (): Promise<IAiChatHistoryItem[]> => {
  return request(`${apiPrefix}/chat/history`, {
    method: RequestMethod.Get,
  }).then((res) => res?.[dataPathName] || []);
};

export const deleteChat = (chatId: string): Promise<void> => {
  return request(`${apiPrefix}/chat/${chatId}`, {
    method: RequestMethod.Delete,
  }).then(() => undefined);
};

export const sendMessage = (data: IAiChatSendMessageRequest): Promise<IAiChatSendMessageResponse> => {
  // 非首次会话发送消息时不再传 action.key，避免覆盖后端的会话语义推断
  const payload: IAiChatSendMessageRequest =
    data.chat_id && data.query.action
      ? {
          ...data,
          query: {
            ...data.query,
            action: {
              ...data.query.action,
              key: '',
            },
          },
        }
      : data;

  return request(`${apiPrefix}/message/new`, {
    method: RequestMethod.Post,
    data: payload,
  }).then((res) => res?.[dataPathName]);
};

export const getMessageDetail = (data: IAiChatMessageLocator): Promise<IAiChatMessage> => {
  return request(`${apiPrefix}/message/detail`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res?.[dataPathName]);
};

export const getMessageHistory = (data: IAiChatMessageHistoryRequest): Promise<IAiChatMessage[]> => {
  return request(`${apiPrefix}/message/history`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res?.[dataPathName] || []);
};

export const cancelMessage = (data: IAiChatMessageLocator): Promise<void> => {
  return request(`${apiPrefix}/message/cancel`, {
    method: RequestMethod.Post,
    data,
  }).then(() => undefined);
};
