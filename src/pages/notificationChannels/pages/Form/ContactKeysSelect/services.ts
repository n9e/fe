import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export interface Item {
  key: string;
  label: string;
}

export function getContactKeys(): Promise<Item[]> {
  return request('/api/n9e/contact-keys', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat ?? [];
  });
}
