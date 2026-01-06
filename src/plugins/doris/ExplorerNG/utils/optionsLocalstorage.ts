import _ from 'lodash';

interface Options {
  logMode: 'origin' | 'table';
  lineBreak: 'true' | 'false';
  reverse: string;
  lines: 'true' | 'false';
  time: 'true' | 'false';
  pageLoadMode?: 'pagination' | 'infiniteScroll'; // 默认 pagination
}

export function getOptionsFromLocalstorage(logsOptionsCacheKey: string): Options {
  const defaultOptions: Options = {
    logMode: 'origin',
    lineBreak: 'false',
    reverse: 'true',
    lines: 'true',
    time: 'true',
    pageLoadMode: 'pagination',
  };
  const options = localStorage.getItem(`${logsOptionsCacheKey}@options`);

  if (options) {
    try {
      return JSON.parse(options);
    } catch (e) {
      return defaultOptions;
    }
  }
  return defaultOptions;
}

export function setOptionsToLocalstorage(logsOptionsCacheKey: string, options: Options) {
  localStorage.setItem(`${logsOptionsCacheKey}@options`, JSON.stringify(options));
}
