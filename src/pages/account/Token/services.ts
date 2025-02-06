import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export const getSelfTokenList = () => {
  return request('/api/n9e/self/token', {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat ?? [];
  });
};

export const postSelfToken = (data) => {
  return request('/api/n9e/self/token', {
    method: RequestMethod.Post,
    data,
  });
};

export const deleteSelfToken = (id: number) => {
  return request(`/api/n9e/self/token/${id}`, {
    method: RequestMethod.Delete,
  });
};
