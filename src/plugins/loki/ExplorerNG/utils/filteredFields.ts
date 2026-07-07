import _ from 'lodash';

export const BUILTIN_FIELDS = ['__n9e_id_n9e__', '__n9e_raw_n9e__', '___id___', '___raw___', '__id__', '__raw__'];
export const LOKI_BUILTIN_FIELDS = ['__timestamp__'];
export const LOKI_HIDDEN_FIELDS = ['timestamp', '__timestamp__', 'stream'];

export function filterOutBuiltinFields(fields: string[]) {
  return _.filter(fields, (field) => !_.includes([...BUILTIN_FIELDS, ...LOKI_HIDDEN_FIELDS], field));
}

export default function filteredFields(fieldKeys: string[], organizeFields?: string[]) {
  const availableFields = filterOutBuiltinFields(fieldKeys);
  const fields = !organizeFields || organizeFields.length === 0 ? availableFields : _.filter(organizeFields, (field) => _.includes(availableFields, field));
  return [..._.filter(fields, (field) => field !== 'line'), ..._.filter(fields, (field) => field === 'line')];
}
