import type { JsonObject, JsonValue } from '../types';

export function isJsonValue(value: unknown): value is JsonValue {
  if (value == null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return true;
  if (Array.isArray(value)) return value.every(isJsonValue);
  if (typeof value === 'object') return Object.values(value).every(isJsonValue);
  return false;
}

export function isJsonObject(value: unknown): value is JsonObject {
  return value != null && typeof value === 'object' && !Array.isArray(value) && isJsonValue(value);
}

export function parseJson(value: string): JsonValue | undefined {
  try {
    const parsed: unknown = JSON.parse(value);
    return isJsonValue(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function extractErrorMessage(value: unknown, seen: WeakSet<object>): string | undefined {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value == null) return undefined;
  if (Array.isArray(value)) {
    const messages = value.map((item) => extractErrorMessage(item, seen)).filter((item): item is string => Boolean(item));
    return messages.length > 0 ? messages.join('; ') : undefined;
  }
  if (typeof value !== 'object') return undefined;
  if (seen.has(value)) return undefined;
  seen.add(value);

  const record = value as Record<string, unknown>;
  // umi-request 的 ResponseError 将后端响应放在 data 或 response.data；它们优先于可能已被对象字符串化的 message。
  const candidates = [
    record.data,
    record.response && typeof record.response === 'object' ? (record.response as Record<string, unknown>).data : undefined,
    record.error,
    record.err,
    record.errors,
    record.detail,
    record.message,
  ];
  for (const candidate of candidates) {
    const message = extractErrorMessage(candidate, seen);
    if (message) return message;
  }
  return undefined;
}

export function getErrorMessage(error: unknown): string {
  return extractErrorMessage(error, new WeakSet()) ?? String(error);
}
