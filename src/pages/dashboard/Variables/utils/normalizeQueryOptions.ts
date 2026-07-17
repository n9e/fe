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

export default function normalizeQueryOptions(options: any[], reg?: string, datasourceCate?: string): { label: string; value: string }[] {
  if (datasourceCate === 'gcm' && _.some(options, isOptionObject)) {
    const normalizedOptions = options.reduce<{ label: string; value: string }[]>((acc, opt) => {
      const item = normalizeOptionObject(opt);
      if (item.value) acc.push(item);
      return acc;
    }, []);
    if (!reg) {
      const seen = new Set<string>();
      return normalizedOptions.filter((item) => {
        const key = item.value;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    return filterOptionsByReg(_.map(normalizedOptions, 'value'), reg);
  }

  return filterOptionsByReg(_.map(options, _.toString), reg);
}
