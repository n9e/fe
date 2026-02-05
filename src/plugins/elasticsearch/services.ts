import _ from 'lodash';
import semver from 'semver';

import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import { N9E_PATHNAME } from '@/utils/constant';

import { normalizeTime } from './utils/index';
import mappingsToFields, { mappingsToFullFields } from './utils/mappingsToFields';
import flattenHits from './utils/flattenHits';
import dslBuilder from './utils/dslBuilder';

export function getIndices(datasourceValue: number, allow_hide_system_indices = false) {
  const params: any = {
    format: 'json',
    s: 'index',
  };
  if (allow_hide_system_indices) {
    params.expand_wildcards = 'all';
  }
  return request(`/api/${N9E_PATHNAME}/proxy/${datasourceValue}/_cat/indices`, {
    method: RequestMethod.Get,
    params,
  }).then((res) => {
    return _.sortBy(_.compact(_.map(res, 'index')));
  });
}

export function getFullIndices(datasourceValue: number, target = '*', allow_hide_system_indices = false, crossClusterEnabled = false) {
  const params: any = {
    format: 'json',
    s: 'index',
  };
  if (crossClusterEnabled) {
    return request(`/api/${N9E_PATHNAME}/proxy/${datasourceValue}/_field_caps`, {
      method: RequestMethod.Get,
      params: {
        fields: '*',
        index: target,
      },
      silence: true,
    }).then((res) => {
      return _.map(_.get(res, 'indices'), (name) => {
        return {
          index: name,
          uuid: name,
        };
      });
    });
  } else {
    if (allow_hide_system_indices) {
      params.expand_wildcards = 'all';
    }
    return request(`/api/${N9E_PATHNAME}/proxy/${datasourceValue}/_cat/indices/${target}`, {
      method: RequestMethod.Get,
      params,
      silence: true,
    }).then((res) => {
      return res;
    });
  }
}

export function getFields(datasourceValue: number, index?: string, type?: string, allow_hide_system_indices = false) {
  const url = index ? `/${index}/_mapping` : '/_mapping';
  return request(`/api/${N9E_PATHNAME}/proxy/${datasourceValue}${url}`, {
    method: RequestMethod.Get,
    params: _.omit(
      {
        expand_wildcards: 'all',
        pretty: true,
      },
      allow_hide_system_indices ? [] : ['expand_wildcards'],
    ),
    silence: true,
  }).then((res) => {
    return {
      allFields: mappingsToFields(res),
      fields: type ? mappingsToFields(res, type) : [],
    };
  });
}

export function getFullFields(
  datasourceValue: number,
  index?: string,
  options: {
    type?: string;
    allowHideSystemIndices?: boolean;
    includeSubFields?: boolean;
    crossClusterEnabled?: boolean;
  } = {
    allowHideSystemIndices: false,
    includeSubFields: false,
    crossClusterEnabled: false,
  },
) {
  if (options.crossClusterEnabled) {
    return request(`/api/${N9E_PATHNAME}/proxy/${datasourceValue}/_field_caps`, {
      method: RequestMethod.Get,
      params: {
        fields: '*',
        index,
      },
      silence: true,
    }).then((res) => {
      const allFields = _.map(_.get(res, 'fields'), (fieldObject, name) => {
        const keys = _.keys(fieldObject);
        return {
          field: name,
          type: keys[0],
          indexable: true,
        };
      });
      return {
        allFields,
        fields: options.type ? _.filter(allFields, { type: options.type }) : [],
      };
    });
  } else {
    const url = index ? `/${index}/_mapping` : '/_mapping';

    return request(`/api/${N9E_PATHNAME}/proxy/${datasourceValue}${url}`, {
      method: RequestMethod.Get,
      params: _.omit(
        {
          expand_wildcards: 'all',
          pretty: true,
        },
        options.allowHideSystemIndices ? [] : ['expand_wildcards'],
      ),
      silence: true,
    }).then((res) => {
      return {
        allFields: _.unionBy(
          mappingsToFullFields(res, {
            includeSubFields: options.includeSubFields,
          }),
          (item) => {
            return item.field + item.type;
          },
        ),
        fields: options.type
          ? _.unionBy(
              mappingsToFullFields(res, {
                type: options.type,
                includeSubFields: options.includeSubFields,
              }),
              (item) => {
                return item.field + item.type;
              },
            )
          : [],
      };
    });
  }
}

const queryControllerMap = new Map();

export function getLogsQuery(datasourceValue: number, requestBody: any, requestId: string) {
  if (queryControllerMap.has(requestId)) {
    queryControllerMap.get(requestId).abort();
    queryControllerMap.delete(requestId);
  }

  const controller = new AbortController();
  queryControllerMap.set(requestId, controller);
  return request(`/api/${N9E_PATHNAME}/proxy/${datasourceValue}/_msearch`, {
    method: RequestMethod.Post,
    data: requestBody,
    headers: {
      'Content-Type': 'application/json',
    },
    signal: controller.signal,
  })
    .then((res) => {
      const dat = _.get(res, 'responses[0].hits');
      const { docs } = flattenHits(dat.hits);
      return {
        total: dat.total.value ?? dat.total,
        list: docs,
      };
    })
    .finally(() => {
      if (queryControllerMap.has(requestId)) {
        queryControllerMap.delete(requestId);
      }
    });
}

export function getDsQuery(datasourceValue: number, requestBody) {
  return request(`/api/${N9E_PATHNAME}/proxy/${datasourceValue}/_msearch`, {
    method: RequestMethod.Post,
    data: requestBody,
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => {
    const dat = _.get(res, 'responses[0].aggregations.A.buckets');
    return dat;
  });
}

export function getESVersion(datasourceValue: number) {
  return request(`/api/${N9E_PATHNAME}/proxy/${datasourceValue}/`, {
    method: RequestMethod.Get,
  }).then((res) => {
    const dat = _.get(res, 'version.number');
    return dat;
  });
}

export function getFieldValues(datasourceValue, requestBody, field, n = 5) {
  return request(`/api/${N9E_PATHNAME}/proxy/${datasourceValue}/_msearch`, {
    method: RequestMethod.Post,
    data: requestBody,
    headers: {
      'Content-Type': 'application/json',
    },
  }).then((res) => {
    const hits = _.get(res, 'responses[0].hits.hits');
    let values: string[] = [];
    _.forEach(hits, (hit) => {
      const value = _.get(hit, ['fields', field]);
      if (value) {
        values = _.concat(values, value);
      }
    });
    const uniqueValues = _.union(values);

    return _.slice(
      _.orderBy(
        _.map(uniqueValues, (value) => {
          return {
            label: value,
            value: _.filter(values, (v) => v === value).length / values.length,
          };
        }),
        ['value'],
        ['desc'],
      ),
      0,
      n,
    );
  });
}

export function addLogsDownloadTask(requestBody) {
  return request(`/api/${N9E_PATHNAME}/logs/download/task`, {
    method: RequestMethod.Post,
    data: requestBody,
  }).then((res) => res.dat);
}

export function getLogsDownloadTasks(params) {
  return request(`/api/${N9E_PATHNAME}/logs/download/tasks`, {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat);
}

export function delDownloadTask(data: { ids: number[] }) {
  return request(`/api/${N9E_PATHNAME}/logs/download/task`, {
    method: RequestMethod.Delete,
    data,
  }).then((res) => res.dat);
}

export async function getHistogram(params: {
  datasourceValue: number;
  query: {
    index: string;
    syntax: string;
    date_field: string;
    query?: string;
  };
  start: number;
  end: number;
  interval: number;
  intervalUnit: 'second' | 'min' | 'hour' | 'day';
  filters?: any[];
}) {
  const { query, datasourceValue, start, end, interval, intervalUnit, filters } = params;
  let series: any[] = [];
  let intervalkey = 'interval';
  try {
    const version = await getESVersion(datasourceValue);
    if (semver.gte(version, '7.17.0')) {
      intervalkey = 'fixed_interval';
    }
  } catch (e) {
    console.error(new Error('get es version error'));
  }

  const res = await getDsQuery(
    datasourceValue,
    dslBuilder({
      index: query.index,
      date_field: query.date_field,
      start: start,
      end: end,
      filters,
      syntax: query.syntax,
      query_string: query.query,
      kuery: query.query,
      date_histogram: {
        intervalkey,
        interval: `${normalizeTime(interval, intervalUnit)}s`,
      },
    }),
  );
  series = [
    {
      id: _.uniqueId('series_'),
      name: 'doc_count',
      metric: {
        __name__: 'doc_count',
      },
      data: _.map(res, (item) => {
        return [item.key / 1000, item.doc_count];
      }),
    },
  ];
  return series;
}
