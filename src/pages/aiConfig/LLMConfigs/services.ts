import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export interface LLMExtraConfig {
  timeout_seconds?: number;
  skip_tls_verify?: boolean;
  proxy?: string;
  custom_headers?: Record<string, string>;
  custom_params?: Record<string, any>;
  temperature?: number;
  max_tokens?: number;
  context_length?: number;
}

export interface AILLMConfig {
  id: number;
  name: string;
  description: string;
  api_type: string;
  api_url: string;
  api_key: string;
  model: string;
  extra_config: LLMExtraConfig;
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

export function testLLMConfig(data: { api_type: string; api_url: string; api_key: string; model: string; extra_config?: LLMExtraConfig }) {
  return request('/api/n9e/ai-llm-config/test', { method: RequestMethod.Post, data }).then((res) => res.dat);
}
