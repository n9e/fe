import { toFixed, toFixedScaled } from './valueFormats';
import type { DecimalCount, FormattedValue } from './valueFormats';

export function toNanoSeconds(size: number, decimals?: DecimalCount): FormattedValue {
  if (size === null) {
    return { text: '' };
  }

  if (Math.abs(size) < 1000) {
    return { text: toFixed(size, decimals), suffix: ' ns' };
  } else if (Math.abs(size) < 1000000) {
    return toFixedScaled(size / 1000, decimals, ' µs');
  } else if (Math.abs(size) < 1000000000) {
    return toFixedScaled(size / 1000000, decimals, ' ms');
  } else if (Math.abs(size) < 60000000000) {
    return toFixedScaled(size / 1000000000, decimals, ' s');
  } else if (Math.abs(size) < 3600000000000) {
    return toFixedScaled(size / 60000000000, decimals, ' min');
  } else if (Math.abs(size) < 86400000000000) {
    return toFixedScaled(size / 3600000000000, decimals, ' hour');
  } else {
    return toFixedScaled(size / 86400000000000, decimals, ' day');
  }
}

export function toMicroSeconds(size: number, decimals?: DecimalCount): FormattedValue {
  if (size === null) {
    return { text: '' };
  }

  if (Math.abs(size) < 1000) {
    return { text: toFixed(size, decimals), suffix: ' µs' };
  } else if (Math.abs(size) < 1000000) {
    return toFixedScaled(size / 1000, decimals, ' ms');
  } else {
    return toFixedScaled(size / 1000000, decimals, ' s');
  }
}

export function toMilliSeconds(size: number, decimals?: DecimalCount): FormattedValue {
  if (size === null) {
    return { text: '' };
  }

  if (Math.abs(size) < 1000) {
    return { text: toFixed(size, decimals), suffix: ' ms' };
  } else if (Math.abs(size) < 60000) {
    // Less than 1 min
    return toFixedScaled(size / 1000, decimals, ' s');
  } else if (Math.abs(size) < 3600000) {
    // Less than 1 hour, divide in minutes
    return toFixedScaled(size / 60000, decimals, ' min');
  } else if (Math.abs(size) < 86400000) {
    // Less than one day, divide in hours
    return toFixedScaled(size / 3600000, decimals, ' hour');
  } else if (Math.abs(size) < 31536000000) {
    // Less than one year, divide in days
    return toFixedScaled(size / 86400000, decimals, ' day');
  }

  return toFixedScaled(size / 31536000000, decimals, ' year');
}

export function toSeconds(size: number, decimals?: DecimalCount): FormattedValue {
  if (size === null) {
    return { text: '' };
  }

  // If 0, use s unit instead of ns
  if (size === 0) {
    return { text: '0', suffix: ' s' };
  }

  // Less than 1 µs, divide in ns
  if (Math.abs(size) < 0.000001) {
    return toFixedScaled(size * 1e9, decimals, ' ns');
  }
  // Less than 1 ms, divide in µs
  if (Math.abs(size) < 0.001) {
    return toFixedScaled(size * 1e6, decimals, ' µs');
  }
  // Less than 1 second, divide in ms
  if (Math.abs(size) < 1) {
    return toFixedScaled(size * 1e3, decimals, ' ms');
  }

  if (Math.abs(size) < 60) {
    return { text: toFixed(size, decimals), suffix: ' s' };
  } else if (Math.abs(size) < 3600) {
    // Less than 1 hour, divide in minutes
    return toFixedScaled(size / 60, decimals, ' min');
  } else if (Math.abs(size) < 86400) {
    // Less than one day, divide in hours
    return toFixedScaled(size / 3600, decimals, ' hour');
  } else if (Math.abs(size) < 604800) {
    // Less than one week, divide in days
    return toFixedScaled(size / 86400, decimals, ' day');
  } else if (Math.abs(size) < 31536000) {
    // Less than one year, divide in week
    return toFixedScaled(size / 604800, decimals, ' week');
  }

  return toFixedScaled(size / 3.15569e7, decimals, ' year');
}
