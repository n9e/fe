import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { ContactType } from './types';

export const getNotifyContacts = function (): Promise<ContactType[]> {
  return request('/api/n9e/notify-contact', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat ?? [];
  });
};

export const putNotifyContacts = function (data: ContactType[]) {
  return request('/api/n9e/notify-contact', {
    method: RequestMethod.Put,
    data,
  });
};
