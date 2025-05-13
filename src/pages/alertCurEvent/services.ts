import _ from 'lodash';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export function getEvents(params) {
  let url = '/api/n9e/alert-cur-events/list';
  if (import.meta.env.VITE_IS_PRO === 'true') {
    url = '/api/n9e-plus/alert-cur-events/list';
  }
  return request(url, {
    method: RequestMethod.Get,
    params,
  });
}
