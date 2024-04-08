import i18next from 'i18next';
import _ from 'lodash';

const alphabet = 'ABCDEFGHIGKLMNOPQRSTUVWXYZ'.split('');

/**
 * 生成查询名称, 根据字母表依次生成，如果已存在则跳过
 * 如果字母表用完则从 AA 到 ZZ
 * @param existingNames 已存在的名称
 * @returns 生成的名称
 */
export const generateQueryName = (existingNames?: string[]) => {
  const names = existingNames || [];
  const allNames = alphabet.map((a) => a);
  for (const a of alphabet) {
    for (const b of alphabet) {
      allNames.push(`${a}${b}`);
    }
  }
  return allNames.find((name) => !names.includes(name));
};

export const validator = (value: string, preValue?: string, existingNames?: string[]) => {
  const names = existingNames || [];
  if (!value) {
    return Promise.reject(i18next.t('QueryName:required'));
  }
  if (!value.match(/^[a-zA-Z][a-zA-Z0-9_]*$/)) {
    return Promise.reject(i18next.t('QueryName:invalidName'));
  }
  if (value !== preValue && _.includes(names, value)) {
    return Promise.reject(i18next.t('QueryName:duplicateName'));
  }
  return Promise.resolve();
};
