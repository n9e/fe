import _ from 'lodash';

import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { DatasourceCateEnum } from '@/utils/constant';

import { DataResp, FieldNameSuggestion, FieldValueSuggestion, HistogramValue } from './types';
import { filterOutBuilderSuggestionBlockedFields } from './utils/filteredFields';

export function logsQuery(data: {
  cate: DatasourceCateEnum;
  datasource_id: number;
  query: {
    query: string;
    start: number;
    end: number;
    limit?: number;
    offset?: number;
    ref: string;
  }[];
}): Promise<{
  list: Record<string, any>[];
  total: number;
}> {
  return request('/api/n9e/logs-query', {
    method: RequestMethod.Post,
    data,
    silence: true,
  }).then((res) => res.dat || { list: [], total: 0 });
}

export function dsQuery(data: { cate: DatasourceCateEnum; datasource_id: number; query: Record<string, any>[] }): Promise<DataResp[]> {
  return request('/api/n9e/ds-query', {
    method: RequestMethod.Post,
    data,
    silence: true,
  }).then((res) => res.dat || []);
}

export function getFieldNames(data: {
  cate: DatasourceCateEnum;
  datasource_id: number;
  query: string;
  start: number;
  end: number;
  filter?: string;
  limit?: number;
}): Promise<FieldNameSuggestion[]> {
  return request('/api/n9e/victorialogs-field-names', {
    method: RequestMethod.Post,
    data: {
      ...data,
      scope: 'field',
    },
    silence: true,
  }).then((res) => filterOutBuilderSuggestionBlockedFields(_.sortBy(res.dat || [], 'field')));
}

export function getFieldValues(data: {
  cate: DatasourceCateEnum;
  datasource_id: number;
  query: string;
  start: number;
  end: number;
  field: string;
  filter?: string;
  limit?: number;
}): Promise<FieldValueSuggestion[]> {
  return request('/api/n9e/victorialogs-field-values', {
    method: RequestMethod.Post,
    data: {
      ...data,
      scope: 'field',
    },
    silence: true,
  }).then((res) => res.dat || []);
}

export function getHistogram(data: {
  cate: DatasourceCateEnum;
  datasource_id: number;
  query: {
    query: string;
    start: number;
    end: number;
    step?: string;
    group_by?: string;
  }[];
}): Promise<HistogramValue[]> {
  return request('/api/n9e/victorialogs-histogram', {
    method: RequestMethod.Post,
    data,
    silence: true,
  }).then((res) => res.dat || []);
}
