import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { NotifyTplsType } from './types';

export const getNotifyTpls = function (): Promise<NotifyTplsType[]> {
  return request('/api/n9e/notify-tpls', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat || [];
  });
};

export const postNotifyTpl = function (data: NotifyTplsType) {
  return request('/api/n9e/notify-tpl', {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat;
  });
};

export const deleteNotifyTpl = function (id: number) {
  return request(`/api/n9e/notify-tpl/${id}`, {
    method: RequestMethod.Delete,
  }).then((res) => {
    return res.dat;
  });
};

export const putNotifyTpl = function (data: NotifyTplsType) {
  return request('/api/n9e/notify-tpl', {
    method: RequestMethod.Put,
    data,
  }).then((res) => {
    return res.dat;
  });
};

export const putNotifyTplContent = function (data: NotifyTplsType) {
  return request('/api/n9e/notify-tpl/content', {
    method: RequestMethod.Put,
    data,
  }).then((res) => {
    return res.dat;
  });
};

export const previewTemplate = function (data: NotifyTplsType) {
  return request('/api/n9e/notify-tpl/preview', {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat;
  });
};
