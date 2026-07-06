import _ from 'lodash';

export const BUILTIN_FIELDS = ['__n9e_id_n9e__', '__n9e_raw_n9e__', '___id___', '___raw___', '__id__', '__raw__'];
export const VICTORIALOGS_BUILTIN_FIELDS = ['_msg', '_time', '_stream_id', '_stream'];
export const BUILDER_SUGGESTION_BLOCKED_FIELDS = new Set(['_time', '_msg', '_stream', '_stream_id']);

export function isBuilderSuggestionBlockedField(field?: string) {
  if (!field) return false;
  return BUILDER_SUGGESTION_BLOCKED_FIELDS.has(field) || _.startsWith(field, '_stream.');
}

export function filterOutBuiltinFields(fields: string[]) {
  return _.filter(fields, (field) => !_.includes([...BUILTIN_FIELDS, ...VICTORIALOGS_BUILTIN_FIELDS], field));
}

export function filterOutBuilderSuggestionBlockedFields<T extends { field?: string }>(fields: T[]) {
  return _.filter(fields, (field) => !isBuilderSuggestionBlockedField(field.field));
}

export default function filteredFields(fieldKeys: string[], organizeFields?: string[]) {
  const availableFields = filterOutBuiltinFields(fieldKeys);
  if (!organizeFields || organizeFields.length === 0) return availableFields;
  return _.filter(organizeFields, (field) => _.includes(availableFields, field));
}
