import _ from 'lodash';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export function getEvents(params) {
  return request('/api/n9e/alert-his-events/list', {
    method: RequestMethod.Get,
    params,
  });
}

export function getEventsByIds(ids: string) {
  return request(`/api/n9e-plus/alert-his-events/${ids}`, {
    method: RequestMethod.Get,
  });
}
