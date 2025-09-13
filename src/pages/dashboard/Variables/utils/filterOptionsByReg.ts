import _ from 'lodash';

import stringToRegex from './stringToRegex';

export default function filterOptionsByReg(options: string[], reg?: string) {
  const regex = stringToRegex(reg);

  if (reg && regex) {
    const regFilterOptions: {
      label: string;
      value: string;
    }[] = [];
    _.forEach(options, (option) => {
      if (!!option) {
        const matchResult = option.match(regex);
        if (matchResult) {
          if (matchResult.groups) {
            regFilterOptions.push({
              label: matchResult.groups?.text,
              value: matchResult.groups?.value,
            });
          } else if (matchResult.length > 0) {
            if (matchResult[1]) {
              regFilterOptions.push({
                label: matchResult[1],
                value: matchResult[1],
              });
            } else {
              regFilterOptions.push({
                label: option,
                value: option,
              });
            }
          }
        }
      }
    });
    return _.unionBy(regFilterOptions, (item) => {
      return `${item.label}-${item.value}`;
    });
  }
  return _.map(options, (item) => {
    return {
      label: item,
      value: item,
    };
  });
}
