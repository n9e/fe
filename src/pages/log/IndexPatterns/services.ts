/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { N9E_PATHNAME } from '@/utils/constant';
import { FieldConfig, FieldConfigVersion2, convertToVersion2 } from './types';
import _ from 'lodash';

const sortESIndexPatterns = (data: any[] = []) => {
  const hasValidWeight = (weight: unknown) => {
    return weight !== undefined && weight !== null && weight !== '' && Number.isFinite(Number(weight));
  };
  const getWeight = (weight: unknown) => Number(weight);
  const getCreateOrder = (item: any, index: number) => {
    const time = item.create_at ?? item.created_at;
    const numberTime = Number(time);
    if (Number.isFinite(numberTime)) return numberTime;
    if (typeof time === 'string') {
      const parsedTime = Date.parse(time);
      if (Number.isFinite(parsedTime)) return parsedTime;
    }
    const id = Number(item.id);
    if (Number.isFinite(id)) return id;
    return index;
  };
  const wrappedData = _.map(data, (item, index) => ({ item, index }));
  const validWeightItems = wrappedData.filter(({ item }) => hasValidWeight(item.weight));
  const uniqueWeights = new Set(validWeightItems.map(({ item }) => getWeight(item.weight)));
  const hasCustomWeight = uniqueWeights.size > 1;
  const effectiveWeightItems = new Set<any>();

  if (hasCustomWeight) {
    const firstItemByWeight = new Map<number, { item: any; index: number }>();
    validWeightItems.forEach((wrapped) => {
      const weight = getWeight(wrapped.item.weight);
      const current = firstItemByWeight.get(weight);
      if (!current || getCreateOrder(wrapped.item, wrapped.index) < getCreateOrder(current.item, current.index)) {
        firstItemByWeight.set(weight, wrapped);
      }
    });
    firstItemByWeight.forEach(({ item }) => {
      effectiveWeightItems.add(item);
    });
  }

  return wrappedData.sort((a, b) => {
    if (hasCustomWeight) {
      const aHasWeight = effectiveWeightItems.has(a.item);
      const bHasWeight = effectiveWeightItems.has(b.item);
      if (aHasWeight !== bHasWeight) {
        return aHasWeight ? -1 : 1;
      }
      if (aHasWeight && bHasWeight) {
        const weightDiff = getWeight(a.item.weight) - getWeight(b.item.weight);
        if (weightDiff !== 0) return weightDiff;
      }
    }

    const createOrderDiff = getCreateOrder(a.item, a.index) - getCreateOrder(b.item, b.index);
    if (createOrderDiff !== 0) return createOrderDiff;
    return a.index - b.index;
  }).map(({ item }) => item);
};

export const getESIndexPatterns = function (datasource_id?: number) {
  return request(`/api/${N9E_PATHNAME}/es-index-pattern-list`, {
    method: RequestMethod.Get,
    params: {
      datasource_id,
    },
  }).then((res) => sortESIndexPatterns(res.dat));
};

export const getESIndexPatternsWithParmas = function (params?: { datasource_id?: number; __token?: string; source_type?: string; eid?: number }) {
  return request(`/api/${N9E_PATHNAME}/es-index-pattern-list`, {
    method: RequestMethod.Get,
    params,
  }).then((res) => sortESIndexPatterns(res.dat));
};

export const getESIndexPattern = function (id: number) {
  return request('/api/n9e/es-index-pattern', {
    method: RequestMethod.Get,
    params: {
      id,
    },
  }).then((res) => res.dat);
};

export const postESIndexPattern = function (data: any) {
  return request('/api/n9e/es-index-pattern', {
    method: RequestMethod.Post,
    data,
  });
};

export const putESIndexPattern = function (id, data: any) {
  return request('/api/n9e/es-index-pattern', {
    method: RequestMethod.Put,
    params: {
      id,
    },
    data,
  });
};

export const deleteESIndexPattern = function (id: number) {
  return request('/api/n9e/es-index-pattern', {
    method: RequestMethod.Delete,
    data: { ids: [id] },
  });
};

export const putESIndexPatternWeights = function (
  data: {
    id: number;
    weight: number;
  }[],
) {
  return request('/api/n9e/es-index-patterns/weights', {
    method: RequestMethod.Put,
    data,
  });
};

export function standardizeFieldConfig(fieldConfig: FieldConfig | FieldConfigVersion2): FieldConfigVersion2 {
  if (fieldConfig.version === 1) {
    return convertToVersion2(fieldConfig as FieldConfig);
  }

  if (fieldConfig.version === 2) {
    return fieldConfig as FieldConfigVersion2;
  }
  return {
    arr: [],
    linkArr: [],
    version: 2,
  };
}
