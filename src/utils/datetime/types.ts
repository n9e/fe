import { MomentInput, MomentBuiltinFormat } from 'moment-timezone';

export type TimeZone = string;

export interface TimeZoneOptions {
  timeZone?: TimeZone;
}

export interface DateTimeOptions extends TimeZoneOptions {
  format?: string;
}

export enum InternalTimeZones {
  default = '',
  localBrowserTime = 'browser',
  utc = 'utc',
}

export type DateTimeFormatter<T extends DateTimeOptions = DateTimeOptions> = (dateInUtc: MomentInput, options?: T) => string;

export type FormatInput = string | MomentBuiltinFormat | undefined;

export interface DateTimeOptionsWithFormat extends DateTimeOptions {
  defaultWithMS?: boolean;
}
