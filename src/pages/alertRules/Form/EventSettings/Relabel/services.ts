import _ from 'lodash';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export const relabelTest = (data: { configs: any[]; tags: string[] }) => {
  return request('/api/n9e/relabel-test', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};
