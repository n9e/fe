import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export function getLLMProviders() {
  return request('/api/n9e/llm-providers', {
    method: RequestMethod.Get,
  });
}
