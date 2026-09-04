/*
 * Grafana → N9E 的单位、颜色、宏映射表（依据 skill mapping-common.md / mapping-targets.md）。
 */
import _ from 'lodash';

/** Grafana 内置颜色名 → hex（thresholds 等处的颜色直接输出 hex） */
export const grafanaBuiltinColors: { color: string; name: string }[] = [
  { color: '#FFA6B0', name: 'super-light-red' },
  { color: '#FF7383', name: 'light-red' },
  { color: '#F2495C', name: 'red' },
  { color: '#E02F44', name: 'semi-dark-red' },
  { color: '#C4162A', name: 'dark-red' },
  { color: '#FFCB7D', name: 'super-light-orange' },
  { color: '#FFB357', name: 'light-orange' },
  { color: '#FF9830', name: 'orange' },
  { color: '#FF780A', name: 'semi-dark-orange' },
  { color: '#FA6400', name: 'dark-orange' },
  { color: '#FFF899', name: 'super-light-yellow' },
  { color: '#FFEE52', name: 'light-yellow' },
  { color: '#FADE2A', name: 'yellow' },
  { color: '#F2CC0C', name: 'semi-dark-yellow' },
  { color: '#E0B400', name: 'dark-yellow' },
  { color: '#C8F2C2', name: 'super-light-green' },
  { color: '#96D98D', name: 'light-green' },
  { color: '#73BF69', name: 'green' },
  { color: '#56A64B', name: 'semi-dark-green' },
  { color: '#37872D', name: 'dark-green' },
  { color: '#C0D8FF', name: 'super-light-blue' },
  { color: '#8AB8FF', name: 'light-blue' },
  { color: '#5794F2', name: 'blue' },
  { color: '#3274D9', name: 'semi-dark-blue' },
  { color: '#1F60C4', name: 'dark-blue' },
  { color: '#DEB6F2', name: 'super-light-purple' },
  { color: '#CA95E5', name: 'light-purple' },
  { color: '#B877D9', name: 'purple' },
  { color: '#A352CC', name: 'semi-dark-purple' },
  { color: '#8F3BB8', name: 'dark-purple' },
];

/** Grafana 颜色名 → hex；非内置颜色（自定义 hex / rgba）原样返回 */
export function grafanaColorNameToHex(color: unknown): string {
  if (typeof color !== 'string' || !color) return '';
  return _.find(grafanaBuiltinColors, { name: color })?.color || color;
}

/** Grafana 单位 id → N9E 单位（mapping-common.md §4） */
export const grafanaUnitToN9E: Record<string, string> = {
  none: 'none',
  s: 'seconds',
  ms: 'milliseconds',
  µs: 'microseconds',
  ns: 'nanoseconds',
  percent: 'percent',
  percentunit: 'percentUnit',
  bytes: 'bytesIEC',
  bits: 'bitsIEC',
  decbytes: 'bytesSI',
  decbits: 'bitsSI',
  short: 'short',
  sishort: 'sishort',
  count: 'count',
  dateTimeAsIso: 'datetimeMilliseconds',
  dateTimeAsLocal: 'datetimeMilliseconds',
  dateTimeAsSystem: 'datetimeMilliseconds',
  // N9E 无 duration 展示单位，降级为 seconds（需报告）
  dtdurations: 'seconds',
  celsius: 'celsius',
  fahrenheit: 'fahrenheit',
  kelvin: 'kelvin',
  dBm: 'dBm',
  pps: 'packetsSec',
  Bps: 'bytesSecSI',
  binBps: 'bytesSecIEC',
  bps: 'bitsSecSI',
  binbps: 'bitsSecIEC',
  cps: 'cps',
  ops: 'ops',
  reqps: 'reqps',
  rps: 'rps',
  wps: 'wps',
  iops: 'iops',
  eps: 'eps',
  mps: 'mps',
  recps: 'recps',
  rowsps: 'rowsps',
  cpm: 'cpm',
  opm: 'opm',
  reqpm: 'reqpm',
  rpm: 'rpm',
  wpm: 'wpm',
  iopm: 'iopm',
  epm: 'epm',
  mpm: 'mpm',
  recpm: 'recpm',
  rowspm: 'rowspm',
  lengthmm: 'millimeter',
  lengthcm: 'centimeter',
  lengthin: 'inch',
  lengthft: 'foot',
  lengthm: 'meter',
  lengthkm: 'kilometer',
  lengthmi: 'mile',
  kbytes: 'kibibytes',
  deckbytes: 'kilobytes',
  mbytes: 'mebibytes',
  decmbytes: 'megabytes',
  gbytes: 'gibibytes',
  decgbytes: 'gigabytes',
  tbytes: 'tebibytes',
  dectbytes: 'terabytes',
  pbytes: 'pebibytes',
  decpbytes: 'petabytes',
};

/** 是否发生了降级（dtdurations → seconds） */
const DOWNGRADED_UNITS = new Set(['dtdurations']);

/** Grafana 单位 → N9E 单位；无法映射 → 'none'（downgraded） */
export function mapUnitToN9E(unit: unknown): { unit: string; downgraded: boolean } {
  if (typeof unit !== 'string' || !unit) {
    return { unit: 'none', downgraded: false };
  }
  const mapped = grafanaUnitToN9E[unit];
  if (mapped) {
    return { unit: mapped, downgraded: DOWNGRADED_UNITS.has(unit) };
  }
  return { unit: 'none', downgraded: true };
}

/** 聚合计算类型规范化（mapping-common.md §6） */
const SUPPORTED_CALCS = ['lastNotNull', 'last', 'firstNotNull', 'first', 'min', 'max', 'sum', 'count', 'avg'];

export function normalizeCalc(calc: unknown): string {
  if (typeof calc !== 'string') return 'lastNotNull';
  if (calc === 'mean') return 'avg';
  if (SUPPORTED_CALCS.includes(calc)) return calc;
  return 'lastNotNull';
}

/** 内置宏规范化表（varWithUnitMap，mapping-targets.md §3） */
export const varWithUnitMap: Record<string, string> = {
  '${__interval}s': '${__interval}',
  '${__interval_ms}ms': '${__interval}',
  '${__rate_interval}s': '${__rate_interval}',
  '${__range}s': '${__range}',
  '${__range_s}s': '${__range_s}',
  '${__range_ms}ms': '${__range_ms}',
};

/** 对字符串应用宏规范化（主要用于变量 definition；expr 内宏由运行时处理，不改写） */
export function normalizeMacros(value: unknown): string {
  if (typeof value !== 'string') return '';
  let out = value;
  for (const [key, replacement] of Object.entries(varWithUnitMap)) {
    out = _.replace(out, key, replacement);
  }
  return out;
}
