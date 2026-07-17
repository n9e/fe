import _ from 'lodash';

import filterOptionsByReg from './filterOptionsByReg';

function isOptionObject(option: any) {
  return _.isObject(option) && !_.isArray(option);
}

function normalizeOptionObject(option: any) {
  const value = _.toString(option.value ?? option.label ?? '');
  return {
    label: _.toString(option.label ?? value),
    value,
  };
}

export default function normalizeQueryOptions(options: any[], reg?: string, datasourceCate?: string) {
  if (datasourceCate === 'gcm' && _.some(options, isOptionObject)) {
    const normalizedOptions = _.filter(_.map(options, normalizeOptionObject), (item) => item.value);
    if (!reg) {
      return _.unionBy(normalizedOptions, 'value');
    }
    return filterOptionsByReg(_.map(normalizedOptions, 'value'), reg);
  }

  return filterOptionsByReg(_.map(options, _.toString), reg);
}
