import _ from 'lodash';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export const getInstallDate = (): Promise<number> => {
  return request('/api/n9e/install-date', {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};
