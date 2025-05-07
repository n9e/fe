import { scaledUnits } from './valueFormats';

export interface FormattedValue {
  text: string;
  prefix?: string;
  suffix?: string;
}

export type DecimalCount = number | null | undefined;

export type ValueFormatter = (value: number, decimals?: DecimalCount, scaledDecimals?: DecimalCount) => FormattedValue;

const SI_PREFIXES = ['f', 'p', 'n', 'µ', 'm', '', 'k', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'];
const SI_BASE_INDEX = SI_PREFIXES.indexOf('');

const BIN_PREFIXES = ['', 'Ki', 'Mi', 'Gi', 'Ti', 'Pi', 'Ei', 'Zi', 'Yi'];

export function binaryPrefix(unit: string, offset = 0): ValueFormatter {
  const units = BIN_PREFIXES.map((p) => p + unit);
  return scaledUnits(1024, units, offset);
}

export function SIPrefix(unit: string, offset = 0): ValueFormatter {
  const units = SI_PREFIXES.map((p) => p + unit);
  return scaledUnits(1000, units, SI_BASE_INDEX + offset);
}
