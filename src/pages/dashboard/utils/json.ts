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

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
