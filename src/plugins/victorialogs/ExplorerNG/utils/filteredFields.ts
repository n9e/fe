import _ from 'lodash';

export const BUILTIN_FIELDS = ['__n9e_id_n9e__', '__n9e_raw_n9e__', '___id___', '___raw___', '__id__', '__raw__'];
// _msg is the VictoriaLogs message body (the Loki `line` equivalent), not metadata.
// Keeping it in this list hid it from the origin list and table columns, so the only
// place it appeared was the detail drawer's builtin tag area.
export const VICTORIALOGS_BUILTIN_FIELDS = ['_time', '_stream_id', '_stream'];
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
  const fields = !organizeFields || organizeFields.length === 0 ? availableFields : _.filter(organizeFields, (field) => _.includes(availableFields, field));
  // The message body is the primary content of a log line: keep it in the first column
  // and leave the rest in their original order. Both the origin list and the table view
  // go through this function (LogsViewer's filterFields), so ordering is defined once.
  return [..._.filter(fields, (field) => field === '_msg'), ..._.filter(fields, (field) => field !== '_msg')];
}
