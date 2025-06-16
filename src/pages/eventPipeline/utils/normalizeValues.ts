import _ from 'lodash';

import { Item } from '../types';
interface HeaderItem {
  key: string;
  value: string;
}

export function normalizeFormValues(values: Item): any {
  return {
    ...values,
    processors: _.map(values.processors, (processor: any) => {
      const config = processor?.config || {};
      if (_.includes(['callback', 'event_update', 'ai_summary'], processor?.typ) && config.header) {
        config.header = _.fromPairs(_.map(config.header as HeaderItem[], (item) => [item.key, item.value]));
      }
      if (_.includes(['ai_summary'], processor?.typ) && config.custom_params) {
        config.custom_params = _.fromPairs(_.map(config.custom_params as HeaderItem[], (item) => [item.key, item.value]));
      }
      return {
        ...processor,
        config,
      };
    }),
  };
}

export function normalizeInitialValues(values: any): Item {
  return {
    ...values,
    processors: _.map(values.processors, (processor: any) => {
      const config = processor?.config || {};
      if (_.includes(['callback', 'event_update', 'ai_summary'], processor?.typ) && config.header) {
        config.header = _.map(config.header as { [key: string]: string }, (value, key) => ({
          key,
          value,
        }));
      }
      if (_.includes(['ai_summary'], processor?.typ) && config.custom_params) {
        config.custom_params = _.map(config.custom_params as { [key: string]: string }, (value, key) => ({
          key,
          value,
        }));
      }
      return {
        ...processor,
        config,
      };
    }),
  };
}
