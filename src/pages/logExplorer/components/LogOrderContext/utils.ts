import _ from 'lodash';

/** 采集端写入的文件流身份和原文顺序；__log_seq__ 高 23 位是代次，低 40 位是事件首字节位置，以字符串传输 */
export const LOG_STREAM_ID_FIELD = '__log_stream_id__';
export const LOG_SEQ_FIELD = '__log_seq__';
/** 上下文结果里每行相对锚点的行号，与 SLS 上下文的同名字段一致 */
export const LOG_INDEX_FIELD = '__index_number__';

export interface LogContextCursor {
  time: string;
  seq: string;
  index: number;
}

/** 与 SLS 上下文接口（response_version 2）同形：以 seq/time 为锚点，向前 back_lines 行、向后 forward_lines 行 */
export interface LogContextRequest {
  stream_id: string;
  seq: string;
  time: string;
  cursor_index: number;
  back_lines: number;
  forward_lines: number;
}

export interface LogContextPage {
  logs: Record<string, any>[];
  back_cursor: LogContextCursor;
  forward_cursor: LogContextCursor;
  has_back: boolean;
  has_forward: boolean;
  back_scan_limited: boolean;
  forward_scan_limited: boolean;
}

/** 校验接口响应后再写入页面状态，避免异常页破坏已有日志和翻页游标。 */
export function isLogContextPage(value: unknown): value is LogContextPage {
  const isRecord = (item: unknown): item is Record<string, unknown> => item !== null && typeof item === 'object' && !Array.isArray(item);
  const isCursor = (item: unknown) =>
    isRecord(item) && typeof item.time === 'string' && item.time.trim() !== '' && typeof item.seq === 'string' && /^\d+$/.test(item.seq) && Number.isSafeInteger(item.index);
  return (
    isRecord(value) &&
    Array.isArray(value.logs) &&
    value.logs.every((row) => isRecord(row) && Number.isSafeInteger(row[LOG_INDEX_FIELD])) &&
    isCursor(value.back_cursor) &&
    isCursor(value.forward_cursor) &&
    typeof value.has_back === 'boolean' &&
    typeof value.has_forward === 'boolean' &&
    typeof value.back_scan_limited === 'boolean' &&
    typeof value.forward_scan_limited === 'boolean'
  );
}

export interface LogOrderAnchor {
  streamId: string;
  seq: string;
  /** 时间字段的原始值，原样回传给后端 */
  time: string | number;
}

export function isLogOrderField(field: string) {
  return field === LOG_STREAM_ID_FIELD || field === LOG_SEQ_FIELD;
}

/** 原文顺序字段只用于排序和上下文，不作为可检索、可统计的字段展示 */
export function filterLogOrderFields<T extends { field: string }>(fields: T[]): T[] {
  return _.filter(fields, (item) => !isLogOrderField(item.field));
}

export function getLogOrderAnchor(row: Record<string, any>, timeField: string): LogOrderAnchor | undefined {
  const streamId = row[LOG_STREAM_ID_FIELD];
  const seq = row[LOG_SEQ_FIELD];
  const time = row[timeField];
  if ((typeof time !== 'string' || time.trim() === '') && (typeof time !== 'number' || !Number.isFinite(time))) return undefined;
  if (streamId == null || streamId === '' || seq == null || !/^\d+$/.test(String(seq))) return undefined;
  return { streamId: String(streamId), seq: String(seq), time };
}

/** 拿不到锚点时说明原因：缺两个原文顺序字段（最常见，旧版采集或没保留），或缺时间字段 */
export function logOrderUnavailableReason(row: Record<string, any>, timeField: string): 'no_fields' | 'no_time' | undefined {
  if (getLogOrderAnchor(row, timeField)) return undefined;
  return getLogOrderAnchor({ ...row, [timeField]: 0 }, timeField) ? 'no_time' : 'no_fields';
}

/** 代次变化即文件轮转；序号超过 2^53，必须用 BigInt */
export function logGeneration(seq: unknown) {
  if (seq == null || !/^\d+$/.test(String(seq))) return undefined;
  return (BigInt(String(seq)) >> BigInt(40)).toString();
}

/** ES 索引只有在两个字段映射成 keyword / long 时才能按原文顺序排序；没有平台模板时序号会被映射成 text，按它排序会报错 */
export function esSupportsLogOrder(fields: { field: string; type: string; logOrderTypes?: string[] }[]) {
  const supports = (name: string, type: string) => {
    const matches = fields.filter((field) => field.field === name);
    return (
      matches.length > 0 &&
      matches.every((field) => {
        const types = field.logOrderTypes ?? [field.type];
        return types.length > 0 && types.every((value) => value === type);
      })
    );
  };
  return supports(LOG_STREAM_ID_FIELD, 'keyword') && supports(LOG_SEQ_FIELD, 'long');
}

/** 把翻页结果并入已加载的上下文：按行号去重排序（每页都会带回锚点行），只更新翻页那一侧的游标和状态 */
export function mergeContextPage(prev: LogContextPage, next: LogContextPage, direction: 'back' | 'forward'): LogContextPage {
  const byIndex = new Map<number, Record<string, any>>();
  for (const row of [...prev.logs, ...next.logs]) byIndex.set(row[LOG_INDEX_FIELD], row);
  const logs = [...byIndex.values()].sort((a, b) => a[LOG_INDEX_FIELD] - b[LOG_INDEX_FIELD]);
  return direction === 'back'
    ? { ...prev, logs, back_cursor: next.back_cursor, has_back: next.has_back, back_scan_limited: next.back_scan_limited }
    : { ...prev, logs, forward_cursor: next.forward_cursor, has_forward: next.has_forward, forward_scan_limited: next.forward_scan_limited };
}

function valueText(value: unknown) {
  return value !== null && typeof value === 'object' ? JSON.stringify(value) : String(value ?? '');
}

/** 过滤词像 grep -i a | grep -i b 一样逐个收窄：每个词都要出现在某个字段值里，不区分大小写；只看值，不看字段名，不经过 JSON 转义 */
export function matchesAllKeywords(row: Record<string, any>, keywords: string[], hiddenFields: string[]) {
  if (keywords.length === 0) return true;
  const values = Object.keys(row)
    .filter((key) => !hiddenFields.includes(key))
    .map((key) => valueText(row[key]).toLowerCase());
  return keywords.every((keyword) => values.some((value) => value.includes(keyword.toLowerCase())));
}

// 行太少时 level=INFO 这类碰巧相同的值会被误认成来源；太长的值不适合放进标签
const SOURCE_MIN_ROWS = 5;
const SOURCE_MAX_VALUE_LENGTH = 64;

/** 同一文件流的每一行都相同的字段就是来源（主机、IP、文件等）。不按字段名写死，规则改名、改层级后照样认得出，删掉的自然不出现 */
export function detectSourceFields(rows: Record<string, any>[], hiddenFields: string[]): [string, string][] {
  if (rows.length < SOURCE_MIN_ROWS) return [];
  let candidates = Object.keys(rows[0])
    .filter((key) => !hiddenFields.includes(key))
    .map((key): [string, string] => [key, valueText(rows[0][key])])
    .filter(([, value]) => value !== '' && value.length <= SOURCE_MAX_VALUE_LENGTH);
  for (const row of rows) {
    candidates = candidates.filter(([key, value]) => valueText(row[key]) === value);
    if (candidates.length === 0) break;
  }
  return _.sortBy(candidates, ([key]) => key);
}
