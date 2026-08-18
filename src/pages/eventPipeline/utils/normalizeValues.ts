import _ from 'lodash';

import { Item } from '../types';

const pairsToObject = (value: unknown): unknown => {
  if (!Array.isArray(value)) return value;
  return _.fromPairs(_.map(value, (item) => [item?.key, item?.value]));
};

const objectToPairs = (value: unknown): unknown => {
  if (Array.isArray(value)) return value;
  if (value == null || typeof value !== 'object') return value;
  return _.map(value as Record<string, string>, (v, k) => ({ key: k, value: v }));
};

export function normalizeProcessorsForSubmit(processors: any[] = []): any[] {
  return _.map(_.cloneDeep(processors), (processor: any) => {
    const config = processor?.config || {};
    if (_.includes(['callback', 'event_update', 'ai_summary'], processor?.typ) && config.header != null) {
      config.header = pairsToObject(config.header);
    }
    if (processor?.typ === 'ai_summary' && config.custom_params != null) {
      config.custom_params = pairsToObject(config.custom_params);
    }
    if (processor?.typ === 'alert_shot' && config.url_shot_opts?.headers != null) {
      config.url_shot_opts.headers = pairsToObject(config.url_shot_opts.headers);
    }
    return { ...processor, config };
  });
}

export function normalizeProcessorsForForm(processors: any[] = []): any[] {
  return _.map(_.cloneDeep(processors), (processor: any) => {
    const config = processor?.config || {};
    if (_.includes(['callback', 'event_update', 'ai_summary'], processor?.typ) && config.header != null) {
      config.header = objectToPairs(config.header);
    }
    if (processor?.typ === 'ai_summary' && config.custom_params != null) {
      config.custom_params = objectToPairs(config.custom_params);
    }
    if (processor?.typ === 'alert_shot' && config.url_shot_opts?.headers != null) {
      config.url_shot_opts.headers = objectToPairs(config.url_shot_opts.headers);
    }
    return { ...processor, config };
  });
}

export function normalizeFormValues(values: Item): any {
  values = _.cloneDeep(values);
  return {
    ...values,
    processors: normalizeProcessorsForSubmit(values.processors as any[]),
  };
}

export function normalizeInitialValues(values: any): Item {
  values = _.cloneDeep(values);
  return {
    ...values,
    processors: normalizeProcessorsForForm(values.processors),
  };
}
