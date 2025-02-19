import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { RuleItem } from './types';

export function getList(): Promise<RuleItem[]> {
  return request('/api/n9e/notify-rules', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat ?? [];
  });
}
