import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import type { AIConversation } from './types';

export function getAgents() {
  return request('/api/n9e/ai-agents', {
    method: RequestMethod.Get,
  });
}

export function getConversations(): Promise<{ dat: AIConversation[] }> {
  return request('/api/n9e/ai-conversations', {
    method: RequestMethod.Get,
  });
}

export function createConversation(data: Partial<AIConversation>): Promise<{ dat: AIConversation }> {
  return request('/api/n9e/ai-conversations', {
    method: RequestMethod.Post,
    data,
  });
}

export function getConversation(id: number): Promise<{ dat: { conversation: AIConversation; messages: any[] } }> {
  return request(`/api/n9e/ai-conversation/${id}`, {
    method: RequestMethod.Get,
  });
}

export function updateConversation(id: number, title: string) {
  return request(`/api/n9e/ai-conversation/${id}`, {
    method: RequestMethod.Put,
    data: { title },
  });
}

export function deleteConversation(id: number) {
  return request(`/api/n9e/ai-conversation/${id}`, {
    method: RequestMethod.Delete,
  });
}

export function addConversationMessages(id: number, messages: any[]) {
  return request(`/api/n9e/ai-conversation/${id}/messages`, {
    method: RequestMethod.Post,
    data: messages,
  });
}
