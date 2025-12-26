import _ from 'lodash';

import { Field } from '../services';

export const getSerieName = (metric: any) => {
  const metricName = metric?.__name__ || '';
  const labels = _.keys(metric)
    .filter((ml) => ml !== '__name__')
    .map((label) => {
      return `${label}="${metric[label]}"`;
    });

  return `${metricName}{${_.join(labels, ',')}}`;
};

export const filteredFields = (fields: string[], organizeFields: string[]) => {
  return _.filter(fields, (item) => {
    if (_.includes(['__time', '__package_offset__', '___raw___', '___id___'], item)) {
      return false;
    }
    if (!_.isEmpty(organizeFields)) {
      let included = _.includes(organizeFields, item);
      if (!included) {
        const firstPart = item.split('.')[0];
        included = _.includes(organizeFields, firstPart);
      }
      return included;
    }
    return true;
  });
};

export function getLocalstorageOptions(logsOptionsCacheKey: string) {
  const defaultOptions = {
    logMode: 'origin',
    lineBreak: 'false',
    reverse: 'true',
    jsonDisplaType: 'tree',
    jsonExpandLevel: 1,
    organizeFields: [],
    lines: 'true',
    time: 'true',
    pageLoadMode: 'pagination',
  };
  const options = localStorage.getItem(`${logsOptionsCacheKey}@options`);

  if (options) {
    try {
      return JSON.parse(options);
    } catch (e) {
      return defaultOptions;
    }
  }
  return defaultOptions;
}

export function setLocalstorageOptions(logsOptionsCacheKey, options) {
  localStorage.setItem(`${logsOptionsCacheKey}@options`, JSON.stringify(options));
}

const PIN_INDEX_CACHE_KEY = 'doris_query_logs_pin_index';
export const getPinIndexFromLocalstorage = (options: { datasourceValue: number; database: string; table: string }): Field | undefined => {
  const str = localStorage.getItem(`${PIN_INDEX_CACHE_KEY}@${options.datasourceValue}@${options.database}@${options.table}`);
  if (str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return undefined;
    }
  }
  return undefined;
};
export const setPinIndexToLocalstorage = (options: { datasourceValue: number; database: string; table: string }, field: Field | undefined) => {
  if (field) {
    localStorage.setItem(`${PIN_INDEX_CACHE_KEY}@${options.datasourceValue}@${options.database}@${options.table}`, JSON.stringify(field));
  } else {
    localStorage.removeItem(`${PIN_INDEX_CACHE_KEY}@${options.datasourceValue}@${options.database}@${options.table}`);
  }
};

const DEFAULT_SEARCH_INDEX_CACHE_KEY = 'doris_query_logs_default_search_index';
export const getDefaultSearchIndexFromLocalstorage = (options: { datasourceValue: number; database: string; table: string }): Field | undefined => {
  const str = localStorage.getItem(`${DEFAULT_SEARCH_INDEX_CACHE_KEY}@${options.datasourceValue}@${options.database}@${options.table}`);
  if (str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return undefined;
    }
  }
  return undefined;
};
export const setDefaultSearchIndexToLocalstorage = (options: { datasourceValue: number; database: string; table: string }, field: Field | undefined) => {
  if (field) {
    localStorage.setItem(`${DEFAULT_SEARCH_INDEX_CACHE_KEY}@${options.datasourceValue}@${options.database}@${options.table}`, JSON.stringify(field));
  } else {
    localStorage.removeItem(`${DEFAULT_SEARCH_INDEX_CACHE_KEY}@${options.datasourceValue}@${options.database}@${options.table}`);
  }
};
