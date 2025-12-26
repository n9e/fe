import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import _ from 'lodash';
import { View } from './types';

export type { View } from './types';

export function getViews(page: string): Promise<View[]> {
  return request('/api/n9e/saved-views', {
    method: RequestMethod.Get,
    params: { page },
  }).then((res) => {
    return res.dat || [];
  });
}

export function postView(data: View) {
  return request('/api/n9e/saved-views', {
    method: RequestMethod.Post,
    data: _.omit(data, ['id', 'is_favorite']),
  });
}

export function updateView(id: number, data: View) {
  return request(`/api/n9e/saved-view/${id}`, {
    method: RequestMethod.Put,
    data: _.omit(data, ['id', 'is_favorite']),
  });
}

export function deleteView(id: number) {
  return request(`/api/n9e/saved-view/${id}`, {
    method: RequestMethod.Delete,
  });
}

export function postViewFavorite(id: number) {
  return request(`/api/n9e/saved-view/${id}/favorite`, {
    method: RequestMethod.Post,
    data: { id },
  });
}

export function deleteViewFavorite(id: number) {
  return request(`/api/n9e/saved-view/${id}/favorite`, {
    method: RequestMethod.Delete,
    data: { id },
  });
}
