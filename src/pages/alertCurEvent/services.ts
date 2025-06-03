import _ from 'lodash';

import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { IS_ENT } from '@/utils/constant';

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

export function getAlertCurEventsDatasource(params) {
  return request('/api/n9e/alert-cur-events-datasources', {
    method: RequestMethod.Get,
    params,
  });
}

export function ackEvents(ids: number[], action = 'ack') {
  return request(`/api/n9e-plus/alert-cur-events/${action}`, {
    method: RequestMethod.Post,
    data: {
      ids,
    },
  }).then((res) => res.dat);
}

export function getEventById(eventId) {
  let url = '/api/n9e/alert-his-event';
  if (IS_ENT) {
    url = '/api/n9e-plus/alert-his-event';
  }
  return request(`${url}/${eventId}`, {
    method: RequestMethod.Get,
  });
}
