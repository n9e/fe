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

export interface LogOrderAnchor {
  streamId: string;
  seq: string;
  /** 时间字段的原始值，原样回传给后端 */
  time: string | number;
}

export function isLogOrderField(field: string) {
  return field === LOG_STREAM_ID_FIELD || field === LOG_SEQ_FIELD;
}

export function getLogOrderAnchor(row: Record<string, any>, timeField: string): LogOrderAnchor | undefined {
  const streamId = row[LOG_STREAM_ID_FIELD];
  const seq = row[LOG_SEQ_FIELD];
  const time = row[timeField];
  if (streamId == null || streamId === '' || seq == null || !/^\d+$/.test(String(seq)) || time == null) return undefined;
  return { streamId: String(streamId), seq: String(seq), time };
}

/** 代次变化即文件轮转；序号超过 2^53，必须用 BigInt */
export function logGeneration(seq: unknown) {
  if (seq == null || !/^\d+$/.test(String(seq))) return undefined;
  return (BigInt(String(seq)) >> BigInt(40)).toString();
}

/** ES 索引只有在两个字段映射成 keyword / long 时才能按原文顺序排序；没有平台模板时序号会被映射成 text，按它排序会报错 */
export function esSupportsLogOrder(fields: { field: string; type: string }[]) {
  const types = new Map(fields.map((f) => [f.field, f.type]));
  return types.get(LOG_STREAM_ID_FIELD) === 'keyword' && types.get(LOG_SEQ_FIELD) === 'long';
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
