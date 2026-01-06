import _ from 'lodash';

import { QUERY_LOGS_ORGANIZE_FIELDS_CACHE_KEY, SQL_LOGS_ORGANIZE_FIELDS_CACHE_KEY } from '../../constants';

export function getOrganizeFieldsFromLocalstorage(options: { datasourceValue: number; mode: 'query' | 'sql'; database?: string; table?: string }): string[] {
  let str: string | null = null;
  if (options.mode === 'query') {
    str = localStorage.getItem(`${QUERY_LOGS_ORGANIZE_FIELDS_CACHE_KEY}@${options.datasourceValue}@${options.database}@${options.table}`);
  } else if (options.mode === 'sql') {
    str = localStorage.getItem(`${SQL_LOGS_ORGANIZE_FIELDS_CACHE_KEY}@${options.datasourceValue}`);
  }
  if (str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return [];
    }
  }
  return [];
}
export function setOrganizeFieldsToLocalstorage(options: { datasourceValue: number; mode: 'query' | 'sql'; database?: string; table?: string }, organizeFields: string[]) {
  if (!_.isEmpty(organizeFields)) {
    if (options.mode === 'query') {
      localStorage.setItem(`${QUERY_LOGS_ORGANIZE_FIELDS_CACHE_KEY}@${options.datasourceValue}@${options.database}@${options.table}`, JSON.stringify(organizeFields));
    } else if (options.mode === 'sql') {
      localStorage.setItem(`${SQL_LOGS_ORGANIZE_FIELDS_CACHE_KEY}@${options.datasourceValue}`, JSON.stringify(organizeFields));
    }
  } else {
    if (options.mode === 'query') {
      localStorage.removeItem(`${QUERY_LOGS_ORGANIZE_FIELDS_CACHE_KEY}@${options.datasourceValue}@${options.database}@${options.table}`);
    } else if (options.mode === 'sql') {
      localStorage.removeItem(`${QUERY_LOGS_ORGANIZE_FIELDS_CACHE_KEY}@${options.datasourceValue}`);
    }
  }
}
