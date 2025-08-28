import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export function getEventTagKeys(): Promise<string[]> {
  return request('/api/n9e/event-tagkeys', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
}

export function getEventTagValues(key: string): Promise<string[]> {
  return request('/api/n9e/event-tagvalues', {
    method: RequestMethod.Get,
    params: { key },
  }).then((res) => {
    return res.dat;
  });
}
