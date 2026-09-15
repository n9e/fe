export function hasDatasourceIdentifier<T extends { identifier?: unknown }>(value: T): value is T & { identifier: string } {
  return typeof value.identifier === 'string' && value.identifier.trim().length > 0;
}
