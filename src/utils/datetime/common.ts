import { isEmpty } from 'lodash';

import { TimeZone, TimeZoneOptions } from './types';

export const defaultTimeZone: TimeZone = 'browser';

export const getTimeZone = <T extends TimeZoneOptions>(options?: T): TimeZone => {
  if (options?.timeZone && !isEmpty(options.timeZone)) {
    return options.timeZone;
  }
  return defaultTimeZone;
};
