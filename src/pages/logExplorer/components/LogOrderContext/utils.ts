/** 采集端写入的文件流身份和原文顺序；__log_seq__ 高 23 位是代次，低 40 位是事件首字节位置，以字符串传输 */
export const LOG_STREAM_ID_FIELD = '__log_stream_id__';
export const LOG_SEQ_FIELD = '__log_seq__';

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
