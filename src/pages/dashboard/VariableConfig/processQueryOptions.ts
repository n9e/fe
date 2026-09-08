import _ from 'lodash';

import { transformQueryOptions } from '../Variables/utils/processQueryOptions';
import stringToRegex from '../Variables/utils/stringToRegex';

/** 调用前由旧入口解析正则中的变量，字符串保留旧版提取规则。 */
export default function processLegacyQueryOptions(options: unknown, reg?: string) {
  return transformQueryOptions(options, reg, (scalarOptions) => filterStringOptionsByReg(scalarOptions, reg));
}

function filterStringOptionsByReg(options: string[], reg?: string) {
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
