import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export interface AIAgent {
  id: number;
  name: string;
  description: string;
  use_case: string;
  llm_config_id: number;
  // LLM configuration (legacy inline fields)
  api_type: string;
  api_url: string;
  api_key: string;
  model: string;
  extra_config: string;
  // Status
  is_default: number;
  enabled: number;
  // Metadata
  created_at: number;
  created_by: string;
  updated_at: number;
  updated_by: string;
}

export function getAgents() {
  return request('/api/n9e/ai-agents', { method: RequestMethod.Get }).then((res) => res.dat ?? []);
}

export function addAgent(data: Partial<AIAgent>) {
  return request('/api/n9e/ai-agents', { method: RequestMethod.Post, data });
}

export function updateAgent(id: number, data: Partial<AIAgent>) {
  return request(`/api/n9e/ai-agent/${id}`, { method: RequestMethod.Put, data });
}

export function deleteAgent(id: number) {
  return request(`/api/n9e/ai-agent/${id}`, { method: RequestMethod.Delete });
}

export function testAgentLLM(data: Partial<AIAgent> & { id?: number }) {
  const id = data.id || 0;
  return request(`/api/n9e/ai-agent/${id}/test`, { method: RequestMethod.Post, data }).then((res) => res.dat);
}
