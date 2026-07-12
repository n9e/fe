import _ from 'lodash';

import { QUERY_LOGS_ORGANIZE_FIELDS_CACHE_KEY } from '../../constants';

export function getOrganizeFieldsFromLocalstorage(options: { datasourceValue: number; database?: string; table?: string }): string[] {
  const str = localStorage.getItem(`${QUERY_LOGS_ORGANIZE_FIELDS_CACHE_KEY}@${options.datasourceValue}@${options.database}@${options.table}`);

  if (str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return [];
    }
  }
  return [];
}
export function setOrganizeFieldsToLocalstorage(options: { datasourceValue: number; database?: string; table?: string }, organizeFields: string[]) {
  if (!_.isEmpty(organizeFields)) {
    localStorage.setItem(`${QUERY_LOGS_ORGANIZE_FIELDS_CACHE_KEY}@${options.datasourceValue}@${options.database}@${options.table}`, JSON.stringify(organizeFields));
  } else {
    localStorage.removeItem(`${QUERY_LOGS_ORGANIZE_FIELDS_CACHE_KEY}@${options.datasourceValue}@${options.database}@${options.table}`);
  }
}
