import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { SSOConfigType } from './types';

export const getSSOConfigs = function (): Promise<SSOConfigType[]> {
  return request('/api/n9e/sso-configs', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat || [];
  });
};

export const putSSOConfig = function (data: SSOConfigType) {
  return request('/api/n9e/sso-config', {
    method: RequestMethod.Put,
    data,
  }).then((res) => {
    return res.dat || [];
  });
};
