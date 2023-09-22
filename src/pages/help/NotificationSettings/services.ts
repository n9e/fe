import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { WebhookType, ScriptType, ChannelType } from './types';

export const getWebhooks = function (): Promise<WebhookType[]> {
  return request('/api/n9e/webhooks', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
};

export const putWebhooks = function (data: WebhookType[]) {
  return request('/api/n9e/webhooks', {
    method: RequestMethod.Put,
    data,
  });
};

export const getNotifyScript = function (): Promise<ScriptType> {
  return request('/api/n9e/notify-script', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
};

export const putNotifyScript = function (data: ScriptType) {
  return request('/api/n9e/notify-script', {
    method: RequestMethod.Put,
    data,
  });
};

export const getNotifyChannels = function (): Promise<ChannelType[]> {
  return request('/api/n9e/notify-channel', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
};

export const putNotifyChannels = function (data: ChannelType[]) {
  return request('/api/n9e/notify-channel', {
    method: RequestMethod.Put,
    data,
  });
};

export const getNotifyContacts = function (): Promise<ChannelType[]> {
  return request('/api/n9e/notify-contact', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
};

export const putNotifyContacts = function (data: ChannelType[]) {
  return request('/api/n9e/notify-contact', {
    method: RequestMethod.Put,
    data,
  });
};

export const getNotifyConfig = function (ckey: string): Promise<string> {
  let url = '/api/n9e/notify-config';
  if (import.meta.env.VITE_IS_PRO === 'true') {
    url = '/api/n9e-plus/notify-config';
  }
  return request(url, {
    method: RequestMethod.Get,
    params: { ckey },
  }).then((res) => {
    return res.dat;
  });
};

export const putNotifyConfig = function (data: { ckey: string; cvalue: string }) {
  let url = '/api/n9e/notify-config';
  if (import.meta.env.VITE_IS_PRO === 'true') {
    url = '/api/n9e-plus/notify-config';
  }
  return request(url, {
    method: RequestMethod.Put,
    data,
  });
};

export const smtpConfigTest = function (data: { ckey: string; cvalue: string }) {
  return request('/api/n9e/smtp-config-test', {
    method: RequestMethod.Put,
    data,
  });
};
