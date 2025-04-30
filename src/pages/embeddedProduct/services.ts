import _ from 'lodash';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { EmbeddedProductParams, EmbeddedProductResponse } from './types';

export const getEmbeddedProducts = (): Promise<EmbeddedProductResponse[]> => {
  return request(`/api/n9e/embedded-product`, {
    method: RequestMethod.Get,
  }).then((res) => res.dat);
};
export const getEmbeddedProduct = (id: string): Promise<EmbeddedProductResponse> => {
  return request(`/api/n9e/embedded-product/${id}`, {
    method: RequestMethod.Get,
  }).then((res) => {
    return res.dat;
  });
};

export const addEmbeddedProducts = (data: EmbeddedProductParams[]) => {
  return request(`/api/n9e/embedded-product`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => {
    return res.dat;
  });
};
export const deleteEmbeddedProducts = (id: string): Promise<EmbeddedProductResponse[] | undefined> => {
  return request(`/api/n9e/embedded-product/${id}`, {
    method: RequestMethod.Delete,
  }).then((res) => {
    try {
      return JSON.parse(res.dat);
    } catch (e) {
      return undefined;
    }
  });
};

export const updateEmbeddedProducts = (id: string, data: EmbeddedProductParams): Promise<EmbeddedProductResponse[] | undefined> => {
  return request(`/api/n9e/embedded-product/${id}`, {
    method: RequestMethod.Put,
    data,
  }).then((res) => {
    try {
      return JSON.parse(res.dat);
    } catch (e) {
      return undefined;
    }
  });
};
