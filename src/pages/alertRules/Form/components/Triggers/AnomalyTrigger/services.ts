import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export function getAlgorithms(): Promise<{ [key: string]: string }[]> {
  return request('/api/fc-brain/n9e-algorithms', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.data || [];
  });
}
