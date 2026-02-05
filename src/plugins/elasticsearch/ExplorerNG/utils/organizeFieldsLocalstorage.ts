import _ from 'lodash';

import { LOGS_ORGANIZE_FIELDS_CACHE_KEY } from '../../constants';

export function getOrganizeFieldsFromLocalstorage(options: { datasourceValue: number; index: string }): string[] {
  const str = localStorage.getItem(`${LOGS_ORGANIZE_FIELDS_CACHE_KEY}@${options.datasourceValue}@${options.index}`);

  if (str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return [];
    }
  }
  return [];
}
export function setOrganizeFieldsToLocalstorage(options: { datasourceValue: number; index: string }, organizeFields: string[]) {
  if (!_.isEmpty(organizeFields)) {
    localStorage.setItem(`${LOGS_ORGANIZE_FIELDS_CACHE_KEY}@${options.datasourceValue}@${options.index}`, JSON.stringify(organizeFields));
  } else {
    localStorage.removeItem(`${LOGS_ORGANIZE_FIELDS_CACHE_KEY}@${options.datasourceValue}@${options.index}`);
  }
}
