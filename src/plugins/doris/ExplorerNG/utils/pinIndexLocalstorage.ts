import _ from 'lodash';

import { PIN_INDEX_CACHE_KEY } from '../../constants';
import { Field } from '../../services';

export function getPinIndexFromLocalstorage(options: { datasourceValue: number; database: string; table: string }): Field | undefined {
  const str = localStorage.getItem(`${PIN_INDEX_CACHE_KEY}@${options.datasourceValue}@${options.database}@${options.table}`);
  if (str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return undefined;
    }
  }
  return undefined;
}
export function setPinIndexToLocalstorage(options: { datasourceValue: number; database: string; table: string }, field: Field | undefined) {
  if (field) {
    localStorage.setItem(`${PIN_INDEX_CACHE_KEY}@${options.datasourceValue}@${options.database}@${options.table}`, JSON.stringify(field));
  } else {
    localStorage.removeItem(`${PIN_INDEX_CACHE_KEY}@${options.datasourceValue}@${options.database}@${options.table}`);
  }
}
