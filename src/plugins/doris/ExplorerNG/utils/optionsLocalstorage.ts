import _ from 'lodash';

import { OptionsType } from '@/pages/logExplorer/components/LogsViewer/types';
import { DEFAULT_OPTIONS } from '@/pages/logExplorer/constants';

export function getOptionsFromLocalstorage(logsOptionsCacheKey: string, options?: Partial<OptionsType>): OptionsType {
  const defaultOptions: OptionsType = {
    ...DEFAULT_OPTIONS,
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

export function setOptionsToLocalstorage(logsOptionsCacheKey: string, options: OptionsType) {
  localStorage.setItem(`${logsOptionsCacheKey}@options`, JSON.stringify(options));
}
