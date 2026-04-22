import _ from 'lodash';

const DECIMAL_OR_SCIENTIFIC_NUMBER = /^[-+]?((\d+(\.\d*)?)|(\.\d+))(e[-+]?\d+)?$/i;

export function parseDisplayNumber(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!DECIMAL_OR_SCIENTIFIC_NUMBER.test(trimmed)) {
      return null;
    }
    const parsed = _.toNumber(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function normalizeDataPointValue(value: unknown): string | number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = parseDisplayNumber(value);
  if (parsed !== null) {
    return parsed;
  }

  if (typeof value === 'string') {
    return value;
  }

  return null;
}
