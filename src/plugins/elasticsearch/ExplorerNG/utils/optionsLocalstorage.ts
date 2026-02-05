import _ from 'lodash';

interface Options {
  logMode: 'origin' | 'table';
  lineBreak: 'true' | 'false';
  reverse: string;
  lines: 'true' | 'false';
  time: 'true' | 'false';
  jsonDisplaType: 'tree' | 'string'; // 默认 formatted
  jsonExpandLevel: number;
}

export function getOptionsFromLocalstorage(logsOptionsCacheKey: string, options?: Partial<Options>): Options {
  const defaultOptions: Options = {
    logMode: 'origin',
    lineBreak: 'false',
    reverse: 'true',
    lines: 'true',
    time: 'true',
    jsonDisplaType: 'string',
    jsonExpandLevel: 1,
    ...options,
  };
  const optionsLocalStorage = localStorage.getItem(`${logsOptionsCacheKey}@options`);

  if (optionsLocalStorage) {
    try {
      const parsedOptions = JSON.parse(optionsLocalStorage);
      return { ...defaultOptions, ...parsedOptions };
    } catch (e) {
      return defaultOptions;
    }
  }
  return defaultOptions;
}

export function setOptionsToLocalstorage(logsOptionsCacheKey: string, options: Options) {
  localStorage.setItem(`${logsOptionsCacheKey}@options`, JSON.stringify(options));
}
