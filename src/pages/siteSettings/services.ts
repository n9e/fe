import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { N9E_PATHNAME } from '@/utils/constant';

export const getN9eConfig = function (key: string) {
  return request('/api/n9e/site-info', {
    method: RequestMethod.Get,
    params: { key },
    silence: true,
  }).then((res) => res.dat || '');
};

export const putN9eConfig = function (data: { ckey: string; cval: string }) {
  return request(data.ckey === 'site_info' ? `/api/${N9E_PATHNAME}/config` : '/api/n9e/config', {
    method: RequestMethod.Put,
    data,
  });
};
