import _ from 'lodash';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export function getEvents(params) {
  return request('/api/n9e/alert-his-events/list', {
    method: RequestMethod.Get,
    params,
  });
}
