import _ from 'lodash';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { Record } from './types';

const CONFIG_KEY = 'embedded-dashboards';

export const getEmbeddedDashboards = (): Promise<Record[] | undefined> => {
  return request(`/api/n9e/embedded-dashboards?key=${CONFIG_KEY}`, {
    method: RequestMethod.Get,
  }).then((res) => {
    try {
      return JSON.parse(res.dat);
    } catch (e) {
      return undefined;
    }
  });
};

export const setEmbeddedDashboards = (data: Record[]) => {
  return request(`/api/n9e/embedded-dashboards`, {
    method: RequestMethod.Put,
    data: {
      ckey: CONFIG_KEY,
      cval: JSON.stringify(data),
    },
  }).then((res) => res?.dat);
};
