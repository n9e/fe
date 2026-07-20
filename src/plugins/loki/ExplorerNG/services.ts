import _ from 'lodash';

import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { DatasourceCateEnum } from '@/utils/constant';

import { DataResp, FieldNameSuggestion, FieldValueSuggestion, HistogramValue, LokiLogRow } from './types';

export function logsQuery(data: {
  cate: DatasourceCateEnum;
  datasource_id: number;
  query: {
    query: string;
    start: number | string;
    end: number | string;
    limit?: number;
    direction?: 'forward' | 'backward';
    reverse?: boolean;
    skip_count?: boolean;
    ref: string;
  }[];
}): Promise<{
  list: LokiLogRow[];
  total: number;
}> {
  return request('/api/n9e/logs-query', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat || { list: [], total: 0 });
}

export function dsQuery(data: { cate: DatasourceCateEnum; datasource_id: number; query: Record<string, any>[] }): Promise<DataResp[]> {
  return request('/api/n9e/ds-query', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat || []);
}

export function getLabelNames(data: {
  cate: DatasourceCateEnum;
  datasource_id: number;
  query?: string;
  start: number;
  end: number;
  filter?: string;
  limit?: number;
}): Promise<FieldNameSuggestion[]> {
  return request('/api/n9e/loki-label-names', {
    method: RequestMethod.Post,
    data,
    silence: true,
  }).then((res) => {
    return _.map(_.sortBy(res.dat || []), (field) => (_.isString(field) ? { field } : { field: field.field || field.name || field.label }));
  });
}

export function getLabelValues(data: {
  cate: DatasourceCateEnum;
  datasource_id: number;
  query?: string;
  start: number;
  end: number;
  label: string;
  filter?: string;
  limit?: number;
}): Promise<FieldValueSuggestion[]> {
  return request('/api/n9e/loki-label-values', {
    method: RequestMethod.Post,
    data,
    silence: true,
  }).then((res) => {
    return _.map(res.dat || [], (item) => (_.isString(item) ? { value: item } : { value: item.value }));
  });
}

export function getParsedFields(data: {
  cate: DatasourceCateEnum;
  datasource_id: number;
  query: string;
  start: number;
  end: number;
  limit?: number;
}): Promise<FieldNameSuggestion[]> {
  return request('/api/n9e/loki-parsed-fields', {
    method: RequestMethod.Post,
    data,
    silence: true,
  }).then((res) => {
    return _.sortBy(
      _.filter(
        _.map(res.dat || [], (item) => {
          const field = _.isString(item) ? item : item.field || item.name;
          return {
            field,
            inferred_type: item.inferred_type,
            values: _.map(item.values || [], (value) => _.toString(value)),
          };
        }),
        (item) => !!item.field,
      ),
      'field',
    );
  });
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
    fields_limit?: number;
  }[];
}): Promise<HistogramValue[]> {
  return request('/api/n9e/loki-histogram', {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat || []);
}
