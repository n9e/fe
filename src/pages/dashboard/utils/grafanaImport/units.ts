/*
 * Grafana → N9E 的单位、颜色、宏映射表（依据 skill mapping-common.md / mapping-targets.md）。
 */
import _ from 'lodash';

/** Grafana 的颜色名称按色相和明暗映射到 N9E 的主题色 token。 */
export const grafanaBuiltinColors: { name: string; token: string }[] = [
  { name: 'super-light-red', token: 'red-7' },
  { name: 'light-red', token: 'red-8' },
  { name: 'red', token: 'red-9' },
  { name: 'semi-dark-red', token: 'red-10' },
  { name: 'dark-red', token: 'red-11' },
  { name: 'super-light-orange', token: 'orange-7' },
  { name: 'light-orange', token: 'orange-8' },
  { name: 'orange', token: 'orange-9' },
  { name: 'semi-dark-orange', token: 'orange-10' },
  { name: 'dark-orange', token: 'orange-11' },
  { name: 'super-light-yellow', token: 'yellow-7' },
  { name: 'light-yellow', token: 'yellow-8' },
  { name: 'yellow', token: 'yellow-9' },
  { name: 'semi-dark-yellow', token: 'yellow-10' },
  { name: 'dark-yellow', token: 'yellow-11' },
  { name: 'super-light-green', token: 'green-7' },
  { name: 'light-green', token: 'green-8' },
  { name: 'green', token: 'green-9' },
  { name: 'semi-dark-green', token: 'green-10' },
  { name: 'dark-green', token: 'green-11' },
  { name: 'super-light-blue', token: 'blue-7' },
  { name: 'light-blue', token: 'blue-8' },
  { name: 'blue', token: 'blue-9' },
  { name: 'semi-dark-blue', token: 'blue-10' },
  { name: 'dark-blue', token: 'blue-11' },
  { name: 'super-light-purple', token: 'purple-7' },
  { name: 'light-purple', token: 'purple-8' },
  { name: 'purple', token: 'purple-9' },
  { name: 'semi-dark-purple', token: 'purple-10' },
  { name: 'dark-purple', token: 'purple-11' },
];

/** Grafana 内置颜色名 → N9E 主题 token；自定义颜色原样返回。 */
export function grafanaColorNameToBuiltinToken(color: unknown): string {
  if (typeof color !== 'string' || !color) return '';
  return _.find(grafanaBuiltinColors, { name: color })?.token || color;
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
