import _ from 'lodash';

import stringToRegex from './stringToRegex';

const getAllMatches = (str: string, regex: RegExp): RegExpExecArray[] => {
  const results: RegExpExecArray[] = [];
  let matches: RegExpExecArray | null = null;

  regex.lastIndex = 0;

  do {
    matches = regex.exec(str);
    if (matches) {
      results.push(matches);
    }
  } while (regex.global && matches && matches[0] !== '' && matches[0] !== undefined);

  return results;
};

export default function filterOptionsByReg(options: string[], reg?: string) {
  const regex = stringToRegex(reg);

  if (regex) {
    const regFilterOptions: {
      label: string;
      value: string;
    }[] = [];
    _.forEach(options, (option) => {
      if (!!option) {
        const matches = getAllMatches(option, regex);
        if (!matches.length) {
          return true;
        }

        let label = '';
        let value = '';

        const valueGroup = matches.find((m) => m.groups && m.groups.value);
        const textGroup = matches.find((m) => m.groups && m.groups.text);
        const firstMatch = matches.find((m) => m.length > 1);
        const manyMatches = matches.length > 1 && firstMatch;

        if (valueGroup || textGroup) {
          label = (textGroup?.groups?.text ?? valueGroup?.groups?.value) as string;
          value = (valueGroup?.groups?.value ?? textGroup?.groups?.text) as string;
        } else if (manyMatches) {
          for (let j = 0; j < matches.length; j++) {
            const match = matches[j];
            regFilterOptions.push({ label: match[1], value: match[1] });
          }
          return true;
        } else if (firstMatch) {
          label = firstMatch[1];
          value = firstMatch[1];
        } else {
          // 处理没有捕获组但有完整匹配的情况，如 /dev.*/ 匹配 'dev-flasheye-01'
          label = matches[0][0];
          value = matches[0][0];
        }

        regFilterOptions.push({ label, value });
      }
    });
    return _.unionBy(regFilterOptions, 'value');
  }
  return _.map(options, (item) => {
    return {
      label: item,
      value: item,
    };
  });
}
