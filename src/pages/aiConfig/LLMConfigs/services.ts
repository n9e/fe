import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export interface AILLMConfig {
  id: number;
  name: string;
  description: string;
  api_type: string;
  api_url: string;
  api_key: string;
  model: string;
  extra_config: string;
  enabled: number;
  created_at: number;
  created_by: string;
  updated_at: number;
  updated_by: string;
}

export function getLLMConfigs() {
  return request('/api/n9e/ai-llm-configs', { method: RequestMethod.Get }).then((res) => res.dat ?? []);
}

export function addLLMConfig(data: Partial<AILLMConfig>) {
  return request('/api/n9e/ai-llm-configs', { method: RequestMethod.Post, data });
}

export function updateLLMConfig(id: number, data: Partial<AILLMConfig>) {
  return request(`/api/n9e/ai-llm-config/${id}`, { method: RequestMethod.Put, data });
}

export function deleteLLMConfig(id: number) {
  return request(`/api/n9e/ai-llm-config/${id}`, { method: RequestMethod.Delete });
}

export function testLLMConfig(data: { id?: number; api_type: string; api_url: string; api_key: string; model: string }) {
  const id = data.id || 0;
  return request(`/api/n9e/ai-llm-config/${id}/test`, { method: RequestMethod.Post, data }).then((res) => res.dat);
}
