import _ from 'lodash';

import { DEFAULT_SEARCH_INDEX_CACHE_KEY } from '../../constants';
import { Field } from '../../services';

export function getDefaultSearchIndexFromLocalstorage(options: { datasourceValue: number; database: string; table: string }): Field | undefined {
  const str = localStorage.getItem(`${DEFAULT_SEARCH_INDEX_CACHE_KEY}@${options.datasourceValue}@${options.database}@${options.table}`);
  if (str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return undefined;
    }
  }
  return undefined;
}
export function setDefaultSearchIndexToLocalstorage(options: { datasourceValue: number; database: string; table: string }, field: Field | undefined) {
  if (field) {
    localStorage.setItem(`${DEFAULT_SEARCH_INDEX_CACHE_KEY}@${options.datasourceValue}@${options.database}@${options.table}`, JSON.stringify(field));
  } else {
    localStorage.removeItem(`${DEFAULT_SEARCH_INDEX_CACHE_KEY}@${options.datasourceValue}@${options.database}@${options.table}`);
  }
}
