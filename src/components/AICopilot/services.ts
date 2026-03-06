import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export function getAgents() {
  return request('/api/n9e/ai-agents', {
    method: RequestMethod.Get,
  });
}
