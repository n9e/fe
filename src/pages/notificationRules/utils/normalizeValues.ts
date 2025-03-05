import _ from 'lodash';
import moment from 'moment';

import { RuleItem } from '../types';

export function normalizeFormValues(values: RuleItem): any {
  return {
    ...values,
    notify_configs: _.map(values.notify_configs, (item) => {
      return {
        ...item,
        time_ranges: _.map(item.time_ranges, (timeRange) => {
          return {
            ...timeRange,
            start: timeRange.start.format('HH:mm'),
            end: timeRange.end.format('HH:mm'),
          };
        }),
      };
    }),
  };
}

export function normalizeInitialValues(values: any): RuleItem {
  return {
    ...values,
    notify_configs: _.map(values.notify_configs, (item) => {
      return {
        ...item,
        time_ranges: _.map(item.time_ranges, (timeRange) => {
          return {
            ...timeRange,
            start: moment(timeRange.start, 'HH:mm'),
            end: moment(timeRange.end, 'HH:mm'),
          };
        }),
      };
    }),
  };
}
