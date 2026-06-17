import _ from 'lodash';

import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { IS_ENT } from '@/utils/constant';

export function getEvents(params) {
  let url = '/api/n9e/alert-cur-events/list';
  if (import.meta.env.VITE_IS_PRO === 'true') {
    url = '/api/n9e-plus/alert-cur-events/list';
  }
  // event_ids 可能多达数千个，拼到 URL query 会超长被 nginx 中断(414)，因此改用 POST 放入请求体
  const { event_ids, ...query } = params;
  return request(url, {
    method: RequestMethod.Post,
    params: query,
    data: { event_ids },
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
