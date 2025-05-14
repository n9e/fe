import moment, { Moment, MomentInput } from 'moment-timezone';

import { TimeZone, DateTimeFormatter, FormatInput, DateTimeOptionsWithFormat } from '../datetime/types';
import { getTimeZone } from '../datetime/common';
import { DEFAULT_SYSTEM_DATE_FORMAT, DEFAULT_SYSTEM_DATE_MS_FORMAT } from '../datetime/formats';

export const dateTimeFormat: DateTimeFormatter<DateTimeOptionsWithFormat> = (dateInUtc, options?) => toTz(dateInUtc, getTimeZone(options)).format(getFormat(options));

export const getFormat = <T extends DateTimeOptionsWithFormat>(options?: T): string => {
  if (options?.defaultWithMS) {
    return options?.format ?? DEFAULT_SYSTEM_DATE_MS_FORMAT;
  }
  return options?.format ?? DEFAULT_SYSTEM_DATE_FORMAT;
};

export const toTz = (dateInUtc: MomentInput, timeZone: TimeZone): Moment => {
  const date = dateInUtc;
  const zone = moment.tz.zone(timeZone);

  if (zone && zone.name) {
    return dateTimeAsMoment(toUtc(date)).tz(zone.name);
  }

  switch (timeZone) {
    case 'utc':
      return dateTimeAsMoment(toUtc(date));
    default:
      return dateTimeAsMoment(toUtc(date)).local();
  }
};

export const dateTimeAsMoment = (input?: Moment | MomentInput) => {
  return dateTime(input);
};

export const dateTime = (input?: Moment | MomentInput, formatInput?: FormatInput) => {
  return moment(input, formatInput);
};

export const toUtc = (input?: MomentInput, formatInput?: FormatInput) => {
  return moment.utc(input, formatInput);
};
