import { VictoriaLogsFilter } from '../types';

const stringOperators: VictoriaLogsFilter['op'][] = ['eq', 'neq', 'contains', 'not_contains', 'regex', 'not_regex', 'exists', 'not_exists'];
const numberOperators: VictoriaLogsFilter['op'][] = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'exists', 'not_exists'];
const unknownOperators: VictoriaLogsFilter['op'][] = ['eq', 'neq', 'exists', 'not_exists'];

export default function getOperatorsByFieldType(type?: string): VictoriaLogsFilter['op'][] {
  if (type === 'number') return numberOperators;
  if (type === 'unknown') return unknownOperators;
  return stringOperators;
}
