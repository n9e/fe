import _ from 'lodash';

interface Options {
  logMode: 'origin' | 'table';
  lineBreak: 'true' | 'false';
  reverse: string;
  lines: 'true' | 'false';
  time: 'true' | 'false';
  pageLoadMode?: 'pagination' | 'infiniteScroll'; // 默认 pagination
}

export function getOptionsFromLocalstorage(logsOptionsCacheKey: string, options?: Partial<Options>): Options {
  const defaultOptions: Options = {
    logMode: 'origin',
    lineBreak: 'false',
    reverse: 'true',
    lines: 'true',
    time: 'true',
    pageLoadMode: 'pagination',
    ...options,
  };
  const optionsLocalStorage = localStorage.getItem(`${logsOptionsCacheKey}@options`);

  if (optionsLocalStorage) {
    try {
      return JSON.parse(optionsLocalStorage);
    } catch (e) {
      return defaultOptions;
    }
  }
  return defaultOptions;
}

export function setOptionsToLocalstorage(logsOptionsCacheKey: string, options: Options) {
  localStorage.setItem(`${logsOptionsCacheKey}@options`, JSON.stringify(options));
}
