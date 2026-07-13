import _ from 'lodash';

export function flattenFieldGroup(prefix: 'labels' | 'parsed_fields', fields?: Record<string, string>) {
  return _.mapKeys(fields || {}, (_value, key) => `${prefix}.${key}`);
}
