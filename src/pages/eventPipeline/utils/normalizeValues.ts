import _ from 'lodash';

import { CALLBACK_KEYS } from '../constants';

import { Item } from '../types';
interface HeaderItem {
  key: string;
  value: string;
}

// header 数组转对象
function headerArrayToMap(headerArr?: { key: string; value: string }[]): Record<string, string> {
  if (!Array.isArray(headerArr)) return {};
  return headerArr.reduce((acc, cur) => {
    if (cur.key) acc[cur.key] = cur.value;
    return acc;
  }, {} as Record<string, string>);
}

// header 对象转数组
function headerMapToArray(headerObj?: Record<string, string>): { key: string; value: string }[] {
  if (!headerObj || Array.isArray(headerObj)) return [];
  return Object.entries(headerObj).map(([key, value]) => ({ key, value }));
}

export function normalizeFormValues(values: Item): any {
  return {
    ...values,
    processors: Array.isArray(values.processors)
      ? values.processors.map((processor: any) => {
          if (processor?.typ === 'callback' && processor.config) {
            const config = { ...processor.config };
            // header: array to map
            if (Array.isArray(config.header)) {
              config.header = headerArrayToMap(config.header);
            }
            // 只保留 callback 需要的字段
            return {
              ...processor,
              config: _.pick(config, CALLBACK_KEYS),
            };
          }
          return processor;
        })
      : values.processors,
  };
}

export function normalizeInitialValues(values: any): Item {
  return {
    ...values,
    processors: Array.isArray(values.processors)
      ? values.processors.map((processor: any) => {
          if (processor?.typ === 'callback' && processor.config) {
            const config = { ...processor.config };
            // header: map to array
            if (config.header && !Array.isArray(config.header)) {
              config.header = headerMapToArray(config.header);
            }
            // 只保留 callback 需要的字段
            return {
              ...processor,
              config: _.pick(config, CALLBACK_KEYS),
            };
          }
          return processor;
        })
      : values.processors,
  };
}
