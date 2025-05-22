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
      if (_.includes(['callback', 'event_update'], processor?.typ) && processor.config) {
        return {
          ...processor,
          config: {
            ...processor.config,
            header: _.fromPairs(_.map(processor.config.header as HeaderItem[], (item) => [item.key, item.value])),
          },
        };
      }
      return processor;
    }),
  };
}

export function normalizeInitialValues(values: any): Item {
  return {
    ...values,
    processors: _.map(values.processors, (processor: any) => {
      if (_.includes(['callback', 'event_update'], processor?.typ) && processor.config) {
        return {
          ...processor,
          config: {
            ...processor.config,
            header: Object.entries(processor.config.header || {}).map(([key, value]) => ({
              key,
              value: value as string,
            })),
          },
        };
      }
      return processor;
    }),
  };
}
