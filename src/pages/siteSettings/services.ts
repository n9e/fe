import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export interface Data {
  login_page_logo_url?: string;
  menu_big_logo_url?: string;
  menu_small_logo_url?: string;
  document_url?: string;
  page_title?: string;
  home_page_url?: string;
}

export const getN9eConfig = function (key: string) {
  return request('/api/n9e/config', {
    method: RequestMethod.Get,
    params: { key },
    silence: true, // /api/n9e/config 只有管理员有权限访问
  }).then((res) => res.dat || '');
};

export const putN9eConfig = function (data: { ckey: string; cval: string }) {
  return request('/api/n9e/config', {
    method: RequestMethod.Put,
    data,
  });
};
