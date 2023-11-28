import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import React from 'react';

export const getRecordingRuleSubList = function (busiId: number) {
  return request(`/api/n9e/busi-group/${busiId}/recording-rules`, {
    method: RequestMethod.Get,
  });
};

export const getBusiGroupsRecordingRules = function (gids) {
  return request('/api/n9e/busi-groups/recording-rules', {
    method: RequestMethod.Get,
    params: { gids },
  });
};

export const addOrEditRecordingRule = function (data: any[], busiId: number, method: string) {
  return request(`/api/n9e/busi-group/${busiId}/recording-rules`, {
    method: method,
    data: data,
  });
};

export const getRecordingRule = function (id): Promise<any> {
  return request(`/api/n9e/recording-rule/${id}`, {
    method: RequestMethod.Get,
  });
};

export const editRecordingRule = function (data: any[], busiId: number, strategyId: number) {
  return request(`/api/n9e/busi-group/${busiId}/recording-rule/${strategyId}`, {
    method: RequestMethod.Put,
    data: data,
  });
};

export const deleteRecordingRule = function (ids: number[], strategyId: number) {
  return request(`/api/n9e/busi-group/${strategyId}/recording-rules`, {
    method: RequestMethod.Delete,
    data: { ids },
  });
};

export const updateRecordingRules = function (data: { ids: React.Key[]; fields: any }, busiId: number) {
  return request(`/api/n9e/busi-group/${busiId}/recording-rules/fields`, {
    method: RequestMethod.Put,
    data: data,
  });
};
