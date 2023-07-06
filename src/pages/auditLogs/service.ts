import _ from 'lodash';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export const getAuditLogList = function (params = {}) {
  return request(`/api/n9e/audit/logs`, {
    method: RequestMethod.Get,
    params,
  });
};

export const getAuditEventList = function (params = {}) {
  return request(`/api/n9e/audit/events`, {
    method: RequestMethod.Get,
    params,
  });
};