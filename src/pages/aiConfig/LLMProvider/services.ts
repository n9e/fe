import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export interface LLMProvider {
  id: number;
  name: string;
  api_type: string;
  api_url: string;
  api_key: string;
  model: string;
  is_default: number;
  enabled: number;
  extra_config: string;
  created_at: number;
  created_by: string;
  updated_at: number;
  updated_by: string;
}

export function getLLMProviders() {
  return request('/api/n9e/llm-providers', { method: RequestMethod.Get }).then((res) => res.dat ?? []);
}

export function addLLMProvider(data: Partial<LLMProvider>) {
  return request('/api/n9e/llm-providers', { method: RequestMethod.Post, data });
}

export function updateLLMProvider(id: number, data: Partial<LLMProvider>) {
  return request(`/api/n9e/llm-provider/${id}`, { method: RequestMethod.Put, data });
}

export function deleteLLMProvider(id: number) {
  return request(`/api/n9e/llm-provider/${id}`, { method: RequestMethod.Delete });
}

export function testLLMProvider(id: number) {
  return request(`/api/n9e/llm-provider/${id}/test`, { method: RequestMethod.Post }).then((res) => res.dat);
}
